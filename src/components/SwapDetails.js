import { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, Info } from 'react-feather';
import { FEE_CONFIG } from '../services/lifiService';

const DetailsContainer = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const DetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ $last }) => $last ? '0' : '8px'};
`;

const DetailsLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DetailsValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  padding: 4px 0;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ExpandIcon = styled(ChevronDown)`
  transform: rotate(${({ $expanded }) => $expanded ? '180deg' : '0deg'});
  transition: transform ${({ theme }) => theme.transitions.fast};
`;

const ExpandedDetails = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  display: ${({ $expanded }) => $expanded ? 'block' : 'none'};
`;

const PriceImpact = styled.span`
  color: ${({ $impact, theme }) => {
    if ($impact < 1) return theme.colors.success;
    if ($impact < 3) return theme.colors.warning;
    return theme.colors.error;
  }};
  font-weight: 500;
`;

const InfoIcon = styled(Info)`
  cursor: help;
  color: ${({ theme }) => theme.colors.text.tertiary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SwapDetails = ({ fromAmount, toAmount, fromToken, toToken, slippage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock calculations - in production these would come from actual DEX data
  const exchangeRate = parseFloat(toAmount) / parseFloat(fromAmount);
  const priceImpact = Math.min(parseFloat(fromAmount) * 0.1, 5); // Mock price impact
  const networkFee = 0.015; // Mock network fee in ETH
  const minimumReceived = parseFloat(toAmount) * (1 - parseFloat(slippage) / 100);
  const route = [`${fromToken.symbol}`, `${toToken.symbol}`];

  return (
    <DetailsContainer>
      <DetailsRow>
        <DetailsLabel>Rate</DetailsLabel>
        <DetailsValue>
          1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
        </DetailsValue>
      </DetailsRow>
      
      <DetailsRow $last={!isExpanded}>
        <DetailsLabel>
          Price Impact
          <InfoIcon size={12} />
        </DetailsLabel>
        <DetailsValue>
          <PriceImpact $impact={priceImpact}>
            {priceImpact.toFixed(2)}%
          </PriceImpact>
        </DetailsValue>
      </DetailsRow>

      {isExpanded && (
        <ExpandedDetails $expanded={isExpanded}>
          <DetailsRow>
            <DetailsLabel>
              Minimum received
              <InfoIcon size={12} />
            </DetailsLabel>
            <DetailsValue>{minimumReceived.toFixed(6)} {toToken.symbol}</DetailsValue>
          </DetailsRow>

          <DetailsRow>
            <DetailsLabel>
              Network fee
              <InfoIcon size={12} />
            </DetailsLabel>
            <DetailsValue>{networkFee.toFixed(4)} ETH</DetailsValue>
          </DetailsRow>

          <DetailsRow>
            <DetailsLabel>
              Slippage tolerance
              <InfoIcon size={12} />
            </DetailsLabel>
            <DetailsValue>{slippage}%</DetailsValue>
          </DetailsRow>

          <DetailsRow>
            <DetailsLabel>
              KumaDex fee
              <InfoIcon size={12} />
            </DetailsLabel>
            <DetailsValue>{FEE_CONFIG.feePercentDisplay}</DetailsValue>
          </DetailsRow>

          <DetailsRow $last>
            <DetailsLabel>
              Route
              <InfoIcon size={12} />
            </DetailsLabel>
            <DetailsValue>{route.join(' → ')}</DetailsValue>
          </DetailsRow>
        </ExpandedDetails>
      )}

      <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show less' : 'Show more'}
        <ExpandIcon $expanded={isExpanded} size={16} />
      </ExpandButton>
    </DetailsContainer>
  );
};

export default SwapDetails;