import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';

const Web3Context = createContext({});

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const web3Instance = new Web3(window.ethereum);
        const chainId = await web3Instance.eth.getChainId();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(Number(chainId));
        setIsConnected(true);
        
        localStorage.setItem('walletConnected', 'true');
        
        return true;
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('walletConnected');
  }, []);

  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (err) {
      if (err.code === 4902) {
        setError('Network not added to wallet');
      } else {
        setError('Failed to switch network');
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (!wasConnected) return;

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          const web3Instance = new Web3(window.ethereum);
          const chainId = await web3Instance.eth.getChainId();
          
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setChainId(Number(chainId));
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (account !== accounts[0]) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(Number(chainId));
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, disconnectWallet]);

  const value = {
    web3,
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};