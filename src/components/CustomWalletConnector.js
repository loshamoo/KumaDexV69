import { useState } from 'react';
import styled from 'styled-components';
import { X } from 'react-feather';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  box-shadow: 0 24px 96px rgba(0, 0, 0, 0.25);
  position: relative;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const WalletIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const WalletName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const WalletDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyIiBoZWlnaHQ9IjE4OSIgdmlld0JveD0iMCAwIDIxMiAxODkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiPgo8cGF0aCBkPSJNNDAgMEw4MCA0MEw0MCA4MEwwIDQwTDQwIDBaIiBmaWxsPSIjRjY4NTFCIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDAiPgo8cmVjdCB3aWR0aD0iMjEyIiBoZWlnaHQ9IjE4OSIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K',
    checkAvailability: () => typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask,
    connect: async () => {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Connect using Phantom wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjQUIzOUZGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QPC90ZXh0Pgo8L3N2Zz4K',
    checkAvailability: () => typeof window !== 'undefined' && window.solana && window.solana.isPhantom,
    connect: async () => {
      if (typeof window === 'undefined' || !window.solana) {
        throw new Error('Phantom wallet is not installed');
      }
      await window.solana.connect();
    }
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMDA1MkZGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K',
    checkAvailability: () => typeof window !== 'undefined' && window.ethereum && window.ethereum.isCoinbaseWallet,
    connect: async () => {
      if (typeof window === 'undefined' || !window.ethereum || !window.ethereum.isCoinbaseWallet) {
        window.open('https://wallet.coinbase.com/', '_blank');
        throw new Error('Please install Coinbase Wallet extension');
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  }
];

const CustomWalletConnector = ({ isOpen, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (wallet) => {
    setConnecting(wallet.id);
    setError('');

    try {
      await wallet.connect();
      onConnect?.(wallet);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(null);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal onClick={handleOverlayClick}>
      <ModalContent>
        <Header>
          <Title>Connect Wallet</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <WalletList>
          {wallets.map((wallet) => {
            const isAvailable = wallet.checkAvailability();
            const isConnecting = connecting === wallet.id;

            return (
              <WalletButton
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting || !isAvailable}
              >
                <WalletIcon src={wallet.icon} alt={wallet.name} />
                <WalletInfo>
                  <WalletName>
                    {wallet.name}
                    {isConnecting && ' (Connecting...)'}
                    {!isAvailable && ' (Not Available)'}
                  </WalletName>
                  <WalletDescription>
                    {isAvailable
                      ? wallet.description
                      : 'Please install this wallet to continue'}
                  </WalletDescription>
                </WalletInfo>
              </WalletButton>
            );
          })}
        </WalletList>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ModalContent>
    </Modal>
  );
};

export default CustomWalletConnector;