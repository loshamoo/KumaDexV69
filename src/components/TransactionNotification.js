import styled, { keyframes } from 'styled-components'
import { CheckCircle, XCircle, Loader, ExternalLink } from 'react-feather'
import { getExplorerLink } from '../config/contracts'

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  max-width: 400px;
  background: ${props => {
    switch(props.type) {
      case 'success': return 'linear-gradient(135deg, #00ff88, #00ccff)';
      case 'error': return 'linear-gradient(135deg, #ff0044, #ff00aa)';
      case 'pending': return 'linear-gradient(135deg, #ff8502, #fc72ff)';
      default: return '#191b1f';
    }
  }};
  padding: 2px;
  border-radius: 12px;
  animation: ${slideIn} 0.3s ease-out;
  z-index: 1001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
`

const NotificationContent = styled.div`
  background: ${({ theme }) => theme.colors.background.charcoal};
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${props => {
      switch(props.type) {
        case 'success': return '#00ff88';
        case 'error': return '#ff0044';
        case 'pending': return '#ff8502';
        default: return '#ffffff';
      }
    }};
  }
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const LoadingIcon = styled(Loader)`
  animation: ${rotate} 1s linear infinite;
`

const MessageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Message = styled.div`
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
`

const TxLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00ffff;
  font-size: 0.85rem;
  text-decoration: none;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`

export default function TransactionNotification({ notification }) {
  if (!notification) return null;
  
  const { type, message, txHash } = notification;
  
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'pending':
        return <LoadingIcon size={24} />;
      default:
        return null;
    }
  };
  
  return (
    <NotificationContainer type={type}>
      <NotificationContent>
        <IconWrapper type={type}>
          {getIcon()}
        </IconWrapper>
        <MessageContainer>
          <Message>{message}</Message>
          {txHash && (
            <TxLink 
              href={getExplorerLink('tx', txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on Explorer
              <ExternalLink />
            </TxLink>
          )}
        </MessageContainer>
      </NotificationContent>
    </NotificationContainer>
  );
}