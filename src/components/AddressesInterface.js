import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { Copy, Check, ExternalLink } from 'react-feather';
import { KUMABREEDER_ADDRESS } from '../contracts/KumaBreederABI';
import { DKUMA_ADDRESS } from '../contracts/dKumaABI';
import { DKUMA_BREEDER_ADDRESS } from '../contracts/dKumaBreederABI';

const AddressesContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

// Header section components removed - no longer needed

const AddressesGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, 1fr);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled.div`
  background: linear-gradient(135deg, rgba(25, 27, 31, 0.95) 0%, rgba(25, 27, 31, 0.85) 100%);
  border: 2px solid rgba(255, 0, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: calc(100% - 25px);
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(255, 0, 255, 0.05) 0%, 
      rgba(255, 0, 255, 0.02) 50%, 
      rgba(0, 255, 255, 0.02) 100%
    );
    pointer-events: none;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    border-color: rgba(255, 0, 255, 0.5);
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddressHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

const TokenLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 0, 255, 0.3);
  flex-shrink: 0;
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
  flex-shrink: 0;
`;

const TokenName = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`;

const TokenSymbol = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`;

const TokenDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  padding-top: 4px;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  margin-top: 12px;
  gap: 10px;
  
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const AddressText = styled.div`
  font-family: 'Courier New', monospace;
  color: #ff8502;
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 900px) {
    justify-content: center;
    width: 100%;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${props => props.copied ? 
    'linear-gradient(135deg, #22c55e, #16a34a)' : 
    'linear-gradient(135deg, #ff8502, #fc72ff)'
  };
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px ${props => props.copied ? 
      'rgba(34, 197, 94, 0.4)' : 
      'rgba(255, 0, 255, 0.4)'
    };
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;


const AddressesInterface = () => {
  const [copiedAddresses, setCopiedAddresses] = useState({});

  const contractAddresses = [
    {
      name: 'KUMA Token',
      symbol: 'KUMA',
      address: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
      logo: '/breederlogos/kuma.png',
      network: 'Ethereum',
      description: 'Main KUMA token contract for trading and ecosystem participation.',
      etherscanUrl: 'https://etherscan.io/token/0x48C276e8d03813224bb1e55F953adB6d02FD3E02'
    },
    {
      name: 'dKUMA Token',
      symbol: 'dKUMA',
      address: DKUMA_ADDRESS,
      logo: '/breederlogos/dkuma.png',
      network: 'Ethereum',
      description: 'Governance token with built-in DAO functionality for decentralized decision making.',
      etherscanUrl: `https://etherscan.io/token/${DKUMA_ADDRESS}`
    },
    {
      name: 'KUMA Breeder',
      symbol: 'BREEDER',
      address: KUMABREEDER_ADDRESS,
      logo: '/breederlogos/kuma.png',
      network: 'Ethereum',
      description: 'Staking contract for earning dKUMA rewards through liquidity provision.',
      etherscanUrl: `https://etherscan.io/address/${KUMABREEDER_ADDRESS}`
    },
    {
      name: 'dKUMA Breeder',
      symbol: 'dBREEDER',
      address: DKUMA_BREEDER_ADDRESS,
      logo: '/breederlogos/dkuma.png',
      network: 'Ethereum',
      description: 'Stake dKUMA tokens to earn USDC rewards. 3% deposit fee, 5% withdrawal fee.',
      etherscanUrl: `https://etherscan.io/address/${DKUMA_BREEDER_ADDRESS}`
    },
    {
      name: 'SHIB Token',
      symbol: 'SHIB',
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      logo: '/breederlogos/shib.png',
      network: 'Ethereum',
      description: 'Shiba Inu token - tradeable on KumaDex and stakeable in breeder pools.',
      etherscanUrl: 'https://etherscan.io/token/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
    },
    {
      name: 'LEASH Token',
      symbol: 'LEASH',
      address: '0x27C70Cd1946795B66be9d954418546998b546634',
      logo: '/breederlogos/leash.png',
      network: 'Ethereum',
      description: 'Doge Killer token - part of the Shiba ecosystem, available for staking.',
      etherscanUrl: 'https://etherscan.io/token/0x27C70Cd1946795B66be9d954418546998b546634'
    },
    {
      name: 'ELON Token',
      symbol: 'ELON',
      address: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
      logo: '/breederlogos/elon.png',
      network: 'Ethereum',
      description: 'Dogelon Mars token - tradeable and stakeable within the KumaDex ecosystem.',
      etherscanUrl: 'https://etherscan.io/token/0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3'
    },
    {
      name: 'AKITA Token',
      symbol: 'AKITA',
      address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6',
      logo: '/breederlogos/akita.png',
      network: 'Ethereum',
      description: 'Akita Inu token - community-driven meme token available for trading and staking.',
      etherscanUrl: 'https://etherscan.io/token/0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6'
    }
  ];

  const copyToClipboard = async (address, id) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddresses(prev => ({ ...prev, [id]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedAddresses(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openEtherscan = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <AddressesContainer>
      <AddressesGrid>
        {contractAddresses.map((contract, index) => (
          <AddressCard key={index}>
            <AddressHeader>
              <TokenLogo>
                <Image
                  src={contract.logo}
                  alt={contract.symbol}
                  width={48}
                  height={48}
                  style={{ borderRadius: '50%' }}
                />
              </TokenLogo>
              <TokenInfo>
                <TokenName>{contract.name}</TokenName>
                <TokenSymbol>{contract.symbol}</TokenSymbol>
              </TokenInfo>
              <TokenDescription>{contract.description}</TokenDescription>
            </AddressHeader>
            
            <AddressRow>
              <AddressText>{contract.address}</AddressText>
              <ActionButtons>
                <ActionButton
                  copied={copiedAddresses[`${contract.symbol}-${index}`]}
                  onClick={() => copyToClipboard(contract.address, `${contract.symbol}-${index}`)}
                  title="Copy address"
                >
                  {copiedAddresses[`${contract.symbol}-${index}`] ? (
                    <>
                      <Check />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy />
                      Copy
                    </>
                  )}
                </ActionButton>
                <ActionButton
                  onClick={() => openEtherscan(contract.etherscanUrl)}
                  title="View on Etherscan"
                >
                  <ExternalLink />
                  View
                </ActionButton>
              </ActionButtons>
            </AddressRow>
          </AddressCard>
        ))}
      </AddressesGrid>
    </AddressesContainer>
  );
};

export default AddressesInterface;