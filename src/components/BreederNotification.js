import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { X } from 'react-feather';
import Image from 'next/image';

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, rgba(25, 27, 31, 0.95) 0%, rgba(25, 27, 31, 0.85) 100%);
  border: 2px solid rgba(255, 0, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  max-width: 360px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: ${({ show }) => show ? 'translateX(0)' : 'translateX(100%)'};
  opacity: ${({ show }) => show ? 1 : 0};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    max-width: none;
    top: 70px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const NotificationTitle = styled.h3`
  color: #ff8502;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 0, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 0, 255, 0.2);
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TokenName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const TokenSymbol = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`;

const NotificationText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.primary {
    background: linear-gradient(135deg, #ff8502, #fc72ff);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(255, 0, 255, 0.4);
    }
  }
  
  &.secondary {
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`;

const BreederNotification = ({ token, show, onClose }) => {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (show && token) {
      // Auto-dismiss after 15 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [show, token]);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      onClose();
      setDismissed(false);
    }, 300);
  };

  const handleStakeNow = () => {
    router.push('/breeder');
    handleDismiss();
  };

  const handleRemindLater = () => {
    handleDismiss();
  };

  if (!token || !show || dismissed) {
    return null;
  }

  return (
    <NotificationContainer show={show && !dismissed}>
      <NotificationHeader>
        <NotificationTitle>🚀 Stake & Earn!</NotificationTitle>
        <CloseButton onClick={handleDismiss}>
          <X size={16} />
        </CloseButton>
      </NotificationHeader>
      
      <NotificationBody>
        <TokenInfo>
          <TokenIcon>
            <Image
              src={token.logo}
              alt={token.symbol}
              width={40}
              height={40}
              style={{ borderRadius: '50%' }}
            />
          </TokenIcon>
          <TokenDetails>
            <TokenName>{token.name}</TokenName>
            <TokenSymbol>{token.symbol}</TokenSymbol>
          </TokenDetails>
        </TokenInfo>
        
        <NotificationText>
          Great choice! {token.symbol} is available for staking in our Breeder pools. 
          Earn dKUMA rewards by providing liquidity and staking your {token.symbol} tokens.
        </NotificationText>
        
        <ActionButtons>
          <ActionButton className="primary" onClick={handleStakeNow}>
            Stake Now
          </ActionButton>
          <ActionButton className="secondary" onClick={handleRemindLater}>
            Later
          </ActionButton>
        </ActionButtons>
      </NotificationBody>
    </NotificationContainer>
  );
};

export default BreederNotification;