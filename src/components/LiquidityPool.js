import { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Minus } from 'react-feather';
import TokenInput from './TokenInput';
import { ETHEREUM_TOKENS } from '../data/tokens';

const PoolContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PoolTabs = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 4px;
`;

const PoolTab = styled.button`
  padding: 8px 16px;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.background.module : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const PoolBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlusContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  position: relative;
  z-index: 2;
`;

const PlusButton = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 4px solid ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  background: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.background.interactive : theme.colors.primary};
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.text.secondary : 'white'};
  font-size: 18px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    opacity: ${({ $disabled }) => ($disabled ? 0.7 : 0.9)};
  }
`;

const PoolInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const PoolInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PoolInfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const PoolInfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
`;

const LiquidityPool = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [token0, setToken0] = useState(ETHEREUM_TOKENS[0]);
  const [token1, setToken1] = useState(ETHEREUM_TOKENS[1]);
  const [balance0, setBalance0] = useState('0.0');
  const [balance1, setBalance1] = useState('0.0');
  const [poolShare, setPoolShare] = useState('0.0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          // Mock balance fetch
          setBalance0('5.2341');
          setBalance1('12847.33');
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleToken0AmountChange = (value) => {
    setToken0Amount(value);
    // Mock price calculation - in production this would use actual pool ratios
    if (value && !isNaN(Number(value))) {
      const mockRate = 2000; // 1 ETH = 2000 USDC
      setToken1Amount((Number(value) * mockRate).toFixed(6));
    } else {
      setToken1Amount('');
    }
  };

  const handleToken1AmountChange = (value) => {
    setToken1Amount(value);
    // Reverse calculation
    if (value && !isNaN(Number(value))) {
      const mockRate = 2000;
      setToken0Amount((Number(value) / mockRate).toFixed(6));
    } else {
      setToken0Amount('');
    }
  };

  const handleAddLiquidity = async () => {
    if (!isConnected || !token0Amount || !token1Amount) return;

    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`Successfully added ${token0Amount} ${token0.symbol} and ${token1Amount} ${token1.symbol} to liquidity pool!`);
      setToken0Amount('');
      setToken1Amount('');
      // Update mock pool share
      setPoolShare((parseFloat(poolShare) + 0.05).toFixed(4));
    } catch (error) {
      console.error('Add liquidity failed:', error);
      alert('Add liquidity failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected || parseFloat(poolShare) === 0) return;

    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`Successfully removed liquidity from pool!`);
      setPoolShare('0.0');
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      alert('Remove liquidity failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PoolContainer>
      <PoolHeader>
        <Title>Liquidity</Title>
        <PoolTabs>
          <PoolTab 
            $active={activeTab === 'add'}
            onClick={() => setActiveTab('add')}
          >
            Add
          </PoolTab>
          <PoolTab 
            $active={activeTab === 'remove'}
            onClick={() => setActiveTab('remove')}
          >
            Remove
          </PoolTab>
        </PoolTabs>
      </PoolHeader>

      {activeTab === 'add' ? (
        <PoolBody>
          <TokenInput
            label="First token"
            value={token0Amount}
            onChange={handleToken0AmountChange}
            token={token0}
            onTokenSelect={() => {}}
            balance={balance0}
          />
          <PlusContainer>
            <PlusButton>
              <Plus size={16} />
            </PlusButton>
          </PlusContainer>
          <TokenInput
            label="Second token"
            value={token1Amount}
            onChange={handleToken1AmountChange}
            token={token1}
            onTokenSelect={() => {}}
            balance={balance1}
          />
          
          <ActionButton
            onClick={handleAddLiquidity}
            $disabled={!isConnected || !token0Amount || !token1Amount || isLoading}
          >
            {!isConnected 
              ? 'Connect Wallet' 
              : isLoading 
                ? 'Adding Liquidity...'
                : !token0Amount || !token1Amount 
                  ? 'Enter amounts' 
                  : 'Add Liquidity'
            }
          </ActionButton>
        </PoolBody>
      ) : (
        <PoolBody>
          <PoolInfo>
            <PoolInfoRow>
              <PoolInfoLabel>Your pool share:</PoolInfoLabel>
              <PoolInfoValue>{poolShare}%</PoolInfoValue>
            </PoolInfoRow>
            <PoolInfoRow>
              <PoolInfoLabel>{token0.symbol} deposited:</PoolInfoLabel>
              <PoolInfoValue>{(parseFloat(poolShare) * 0.5).toFixed(4)}</PoolInfoValue>
            </PoolInfoRow>
            <PoolInfoRow>
              <PoolInfoLabel>{token1.symbol} deposited:</PoolInfoLabel>
              <PoolInfoValue>{(parseFloat(poolShare) * 1000).toFixed(2)}</PoolInfoValue>
            </PoolInfoRow>
          </PoolInfo>
          
          <ActionButton
            onClick={handleRemoveLiquidity}
            $disabled={!isConnected || parseFloat(poolShare) === 0 || isLoading}
          >
            {!isConnected 
              ? 'Connect Wallet' 
              : isLoading 
                ? 'Removing Liquidity...'
                : parseFloat(poolShare) === 0 
                  ? 'No liquidity found' 
                  : 'Remove Liquidity'
            }
          </ActionButton>
        </PoolBody>
      )}
    </PoolContainer>
  );
};

export default LiquidityPool;