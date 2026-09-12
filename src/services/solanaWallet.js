// Phantom injected provider (window.solana) — no wallet-adapter stack.

function getInjectedProvider() {
  if (typeof window === 'undefined') return null;
  const phantom = window.phantom?.solana;
  const solana = window.solana;
  if (phantom?.isPhantom) return phantom;
  if (solana?.isPhantom) return solana;
  // Some wallets inject window.solana without the flag
  if (solana && typeof solana.connect === 'function') return solana;
  return null;
}

export function isPhantomAvailable() {
  const p = getInjectedProvider();
  return !!(p && typeof p.connect === 'function');
}

export function getPhantomProvider() {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error('Please install the Phantom wallet extension to swap on Solana');
  }
  return provider;
}

/**
 * Connect Phantom and return the base58 public key string.
 */
export async function connectPhantom() {
  const provider = getPhantomProvider();
  const resp = await provider.connect();
  const key = resp?.publicKey || provider.publicKey;
  if (!key) {
    throw new Error('Phantom connected but no public key was returned');
  }
  return typeof key === 'string' ? key : key.toString();
}

export function getPhantomPublicKey() {
  const provider = getInjectedProvider();
  const key = provider?.publicKey;
  if (!key) return null;
  return typeof key === 'string' ? key : key.toString();
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Deserialize a LiFi base64 SVM transaction and sign+send via Phantom.
 * @param {string|Uint8Array} serialized - base64 string or raw bytes
 * @returns {Promise<string>} transaction signature
 */
export async function signAndSendTransaction(serialized) {
  const provider = getPhantomProvider();
  if (!provider.isConnected && typeof provider.connect === 'function') {
    await provider.connect();
  }

  const { VersionedTransaction, Transaction } = await import('@solana/web3.js');
  const bytes = typeof serialized === 'string' ? base64ToBytes(serialized) : serialized;

  let tx;
  try {
    tx = VersionedTransaction.deserialize(bytes);
  } catch (versionedErr) {
    try {
      tx = Transaction.from(bytes);
    } catch (legacyErr) {
      throw new Error('Could not parse Solana transaction from LiFi quote');
    }
  }

  const result = await provider.signAndSendTransaction(tx);
  const signature = typeof result === 'string' ? result : result?.signature;
  if (!signature) {
    throw new Error('Phantom did not return a transaction signature');
  }
  return signature;
}

export default {
  isPhantomAvailable,
  getPhantomProvider,
  connectPhantom,
  getPhantomPublicKey,
  signAndSendTransaction,
};
