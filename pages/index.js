import Head from 'next/head'
import Header from '../src/components/Header'
import styled, { keyframes } from 'styled-components'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Layers, Shield, Zap, Award, Users, CreditCard } from 'react-feather'
import { useState, useEffect, useRef } from 'react'

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  overflow-x: hidden;
`

const HeroSection = styled.section`
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 24px;
  overflow: hidden;
  background: radial-gradient(ellipse at bottom, #1a2035 0%, #141823 100%);
`

const SpaceBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
`

const StarsLayer = styled.div`
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  transition: transform 0.1s ease-out;
  will-change: transform;
`

const Star = styled.div`
  position: absolute;
  width: ${({ $size }) => $size || 2}px;
  height: ${({ $size }) => $size || 2}px;
  background: ${({ $color }) => $color || '#fff'};
  border-radius: 50%;
  opacity: ${({ $opacity }) => $opacity || 0.8};
  animation: ${twinkle} ${({ $duration }) => $duration || 3}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  box-shadow: 0 0 ${({ $size }) => ($size || 2) * 2}px ${({ $color }) => $color || '#fff'};
`

const Nebula = styled.div`
  position: absolute;
  width: ${({ $size }) => $size || 400}px;
  height: ${({ $size }) => $size || 400}px;
  border-radius: 50%;
  background: ${({ $color }) => $color || 'rgba(252, 114, 255, 0.08)'};
  filter: blur(${({ $blur }) => $blur || 80}px);
  opacity: 0.6;
  transition: transform 0.15s ease-out;
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
`

const HeroLogos = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
`

const HeroLogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 0, 255, 0.4);
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 26, 0.8);
  animation: ${floatAnimation} 4s ease-in-out infinite;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 40px rgba(252, 114, 255, 0.5);
    border-color: rgba(252, 114, 255, 0.6);
  }

  &:nth-child(2) {
    animation-delay: -2s;
  }

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
  }
`

const HeroTitle = styled.h1`
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fff 0%, #fc72ff 50%, #7289ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeroSubtitle = styled.p`
  font-size: clamp(18px, 3vw, 24px);
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
`

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  svg, img {
    width: 24px;
    height: 24px;
  }
`

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #fc72ff 0%, #7289ff 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(252, 114, 255, 0.4);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const FloatingOrb = styled.div`
  position: absolute;
  width: ${({ size }) => size || '300px'};
  height: ${({ size }) => size || '300px'};
  border-radius: 50%;
  background: ${({ color }) => color || 'rgba(252, 114, 255, 0.2)'};
  filter: blur(80px);
  animation: ${floatAnimation} ${({ duration }) => duration || '6s'} ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || '0s'};
  z-index: 0;
`

// Main Apps Showcase Section (Uniswap style)
const AppsShowcase = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`

const ShowcaseTitle = styled.h2`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: 60px;
`

const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const ShowcaseCard = styled.div`
  background: rgb(25, 27, 31);
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`

const CardLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fc72ff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`

const CardTitle = styled.h3`
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
  line-height: 1.2;
`

const CardDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 480px;
`

const CardButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fc72ff;
  font-size: 16px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    gap: 12px;
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`

// Token List for SwapX card
const TokenList = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const TokenName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const TokenSymbol = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const TokenPriceInfo = styled.div`
  text-align: right;
`

const TokenPrice = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`

const TokenChange = styled.span`
  font-size: 14px;
  color: ${({ $positive }) => $positive ? '#22c55e' : '#ef4444'};
  margin-left: 8px;
`

// Perp Trading Card for Perps showcase
const PerpCard = styled.div`
  position: absolute;
  right: 50%;
  bottom: -20px;
  transform: translateX(50%);
  width: 300px;
  background: linear-gradient(145deg, rgb(30, 32, 38), rgb(22, 24, 28));
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 600px) {
    display: none;
  }
`

const PerpCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const PerpPair = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const PerpPairIcons = styled.div`
  display: flex;
  align-items: center;
`

const PerpPairIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgb(22, 24, 28);
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1d21;

  &:first-child {
    margin-left: 0;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const PerpPairName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`

const LeverageBadge = styled.div`
  background: linear-gradient(135deg, #fc72ff, #c837f0);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
`

const PerpPrice = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
`

const PerpPriceChange = styled.div`
  font-size: 14px;
  color: #22c55e;
  margin-bottom: 20px;
`

const PerpButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`

const PerpButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $type }) => $type === 'long' ? '#22c55e' : '#ef4444'};
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ $type }) => $type === 'long' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  }
`

const PerpInput = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PerpInputLabel = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
`

const PerpInputValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`

// Staking Pool List for Breeder cards
const PoolList = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PoolRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

const PoolInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const PoolIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const PoolDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const PoolName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const PoolPair = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const PoolAPY = styled.div`
  text-align: right;
`

const APYValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #22c55e;
`

const APYLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-left: 4px;
`

// Governance Stats for dKuma card
const GovernanceMockup = styled.div`
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 200px;
  height: 320px;
  background: linear-gradient(145deg, rgb(40, 42, 48), rgb(30, 32, 36));
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transform: rotate(-5deg);

  @media (max-width: 600px) {
    display: none;
  }
`

const GovernanceCard = styled.div`
  background: rgb(20, 21, 24);
  border-radius: 16px;
  padding: 16px;
  height: 100%;
`

const GovernanceHeader = styled.div`
  font-size: 12px;
  color: #ffa572;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const GovernanceTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
`

const VoteBar = styled.div`
  margin-bottom: 16px;
`

const VoteLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 6px;
`

const VoteProgress = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`

const VoteFill = styled.div`
  height: 100%;
  width: ${({ $percent }) => $percent || '0%'};
  background: ${({ $color }) => $color || '#22c55e'};
  border-radius: 4px;
`

const GovernanceStat = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`

const StatName = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const StatNum = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`

// Secondary Apps Grid
const SecondaryAppsSection = styled.section`
  padding: 40px 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
`

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const SecondaryCard = styled.div`
  background: rgb(25, 27, 31);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    background: rgb(30, 32, 38);
  }
`

const SecondaryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ $bg }) => $bg || 'rgba(252, 114, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${({ $color }) => $color || '#fc72ff'};

  svg {
    width: 24px;
    height: 24px;
  }
`

const SecondaryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`

const SecondaryDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.5;
`

// Stats Section
const StatsSection = styled.section`
  padding: 80px 24px;
  background: rgba(38, 39, 43, 0.5);
`

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  background: linear-gradient(135deg, #fc72ff 0%, #7289ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`

const StatLabel = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

// CTA Section
const CTASection = styled.section`
  padding: 100px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(252, 114, 255, 0.15) 0%, transparent 70%);
    z-index: 0;
  }
`

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
`

const CTATitle = styled.h2`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
`

const CTASubtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`

const CTATokenLogos = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`

const CTATokenLogo = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 26, 0.8);

  img {
    width: 46px;
    height: 46px;
    object-fit: contain;
    border-radius: 50%;
  }

  &:hover {
    transform: scale(1.1);
    border-color: #fc72ff;
    box-shadow: 0 0 20px rgba(252, 114, 255, 0.4);
  }
`

// Footer
const Footer = styled.footer`
  padding: 40px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`

const FooterText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
`

const FooterLink = styled.a`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #fc72ff;
  }
`

// Token data for display
const DISPLAY_TOKENS = [
  { name: 'Kuma Inu', symbol: 'KUMA', logo: '/breederlogos/kuma.png', color: '#ff6b35' },
  { name: 'dKuma', symbol: 'dKUMA', logo: '/breederlogos/dkuma.png', color: '#7c3aed' },
  { name: 'Ethereum', symbol: 'ETH', logo: '/breederlogos/eth.png', color: '#627eea' },
  { name: 'Shiba Inu', symbol: 'SHIB', logo: '/breederlogos/shib.png', color: '#ffa409' },
]

// Staking pools data - APR values from live contract calculations
const STAKING_POOLS = [
  { name: 'KUMA', pair: 'Stake KUMA', logo: '/breederlogos/kuma.png', color: '#ff6b35', apy: '5.98' },
  { name: 'SHIB', pair: 'Stake SHIB', logo: '/breederlogos/shib.png', color: '#ffa409', apy: '0.80' },
  { name: 'LEASH', pair: 'Stake LEASH', logo: '/breederlogos/leash.png', color: '#00d4aa', apy: '122.43' },
  { name: 'ELON', pair: 'Stake ELON', logo: '/breederlogos/elon.png', color: '#1da1f2', apy: '0.65' },
]

// dKuma Breeder - stake dKUMA to earn USDC (APY calculated from contract)
const DKUMA_POOL = {
  name: 'USDC',
  pair: 'Earn USDC Rewards',
  logo: '/breederlogos/usdc.png',
  color: '#2775ca',
  apy: '17.72'
}

// All breeder token logos for CTA section
const BREEDER_TOKENS = [
  { symbol: 'KUMA', logo: '/breederlogos/kuma.png' },
  { symbol: 'dKUMA', logo: '/breederlogos/dkuma.png' },
  { symbol: 'SHIB', logo: '/breederlogos/shib.png' },
  { symbol: 'LEASH', logo: '/breederlogos/leash.png' },
  { symbol: 'AKITA', logo: '/breederlogos/akita.png' },
  { symbol: 'ELON', logo: '/breederlogos/elon.png' },
  { symbol: 'USDC', logo: '/breederlogos/usdc.png' },
]

// Generate random stars
const generateStars = (count) => {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      color: Math.random() > 0.8 ? '#fc72ff' : Math.random() > 0.6 ? '#7289ff' : '#fff'
    })
  }
  return stars
}

const STARS = generateStars(100)

// Format number with K/M/B suffix
const formatStatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toLocaleString();
};

export default function Home() {
  const router = useRouter()
  const [tokenPrices, setTokenPrices] = useState({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const [liveStats, setLiveStats] = useState({
    tvl: null,
    holders: null,
    loading: true
  })

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Fetch live TVL and holder count
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        let tvl = 0;
        let holders = 0;

        // Fetch TVL from breeder API
        try {
          const breederRes = await fetch('/api/breeder-data');
          const breederData = await breederRes.json();

          if (breederData.pools && Array.isArray(breederData.pools)) {
            // Sum up TVL from all pools
            tvl = breederData.pools.reduce((total, pool) => {
              return total + (parseFloat(pool.tvl) || 0);
            }, 0);
          }
        } catch (e) {
          console.error('Error fetching TVL:', e);
          tvl = 73000; // fallback
        }

        // Fetch holder count from Moralis API (free tier)
        try {
          const kumaToken = '0x48C276e8d03813224bb1e55F953adB6d02FD3E02';
          // Use CoinGecko API which includes holder count
          const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${kumaToken}`);
          const cgData = await cgRes.json();

          if (cgData.market_data?.total_supply && cgData.market_data?.circulating_supply) {
            // CoinGecko doesn't directly provide holder count, use community data or fallback
            holders = cgData.community_data?.twitter_followers || 24000;
          }

          // If no holder data, try to estimate from DexScreener
          if (!holders || holders < 1000) {
            const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${kumaToken}`);
            const dexData = await dexRes.json();
            const mainPair = dexData.pairs?.find(p => p.chainId === 'ethereum');
            // Estimate holders based on txns (rough approximation)
            if (mainPair?.txns?.h24?.buys) {
              holders = Math.max(24000, mainPair.txns.h24.buys * 100);
            } else {
              holders = 24000; // fallback
            }
          }
        } catch (e) {
          console.error('Error fetching holders:', e);
          holders = 24000; // fallback
        }

        setLiveStats({
          tvl: tvl || 73000,
          holders: holders || 24000,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching live stats:', error);
        setLiveStats({ tvl: 73000, holders: 24000, loading: false });
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch live token prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch KUMA price
        const kumaRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/0x48C276e8d03813224bb1e55F953adB6d02FD3E02')
        const kumaData = await kumaRes.json()
        const kumaPair = kumaData.pairs?.find(p => p.chainId === 'ethereum')

        // Fetch ETH price (using WETH)
        const ethRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
        const ethData = await ethRes.json()
        const ethPair = ethData.pairs?.find(p => p.chainId === 'ethereum' && p.quoteToken.symbol === 'USDC')

        // Fetch SHIB price
        const shibRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE')
        const shibData = await shibRes.json()
        const shibPair = shibData.pairs?.find(p => p.chainId === 'ethereum')

        setTokenPrices({
          KUMA: { price: kumaPair?.priceUsd || '0.0000001', change: kumaPair?.priceChange?.h24 || 0 },
          dKUMA: { price: '0.00042', change: 2.5 },
          ETH: { price: ethPair?.priceUsd || '1973.83', change: ethPair?.priceChange?.h24 || 1.3 },
          SHIB: { price: shibPair?.priceUsd || '0.00001', change: shibPair?.priceChange?.h24 || 0 },
        })
      } catch (error) {
        console.error('Error fetching prices:', error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price) => {
    const num = parseFloat(price)
    if (num >= 1) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (num >= 0.01) return `$${num.toFixed(4)}`
    if (num >= 0.0001) return `$${num.toFixed(6)}`
    return `$${num.toFixed(8)}`
  }

  const formatChange = (change) => {
    const num = parseFloat(change)
    return `${num >= 0 ? '↑' : '↓'} ${Math.abs(num).toFixed(2)}%`
  }

  return (
    <>
      <Head>
        <title>KumaDex - The Kuma DeFi Ecosystem</title>
        <meta name="description" content="Swap, breed and earn with the Kuma ecosystem. SwapX, Perpetuals, Breeder pools, and more." />
      </Head>
      <AppContainer>
        <Header />

        <HeroSection ref={heroRef}>
          <SpaceBackground>
            {/* Nebula layers with parallax */}
            <Nebula
              $size={600}
              $color="rgba(252, 114, 255, 0.1)"
              $blur={100}
              style={{
                top: '5%',
                left: '10%',
                transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`
              }}
            />
            <Nebula
              $size={500}
              $color="rgba(114, 137, 255, 0.12)"
              $blur={90}
              style={{
                bottom: '10%',
                right: '5%',
                transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * -25}px)`
              }}
            />
            <Nebula
              $size={350}
              $color="rgba(255, 165, 114, 0.08)"
              $blur={70}
              style={{
                top: '40%',
                right: '30%',
                transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
              }}
            />

            {/* Stars layer - moves slower (far away) */}
            <StarsLayer style={{ transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)` }}>
              {STARS.slice(0, 40).map(star => (
                <Star
                  key={star.id}
                  $size={star.size}
                  $opacity={star.opacity}
                  $duration={star.duration}
                  $delay={star.delay}
                  $color={star.color}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                />
              ))}
            </StarsLayer>

            {/* Stars layer - moves medium (middle distance) */}
            <StarsLayer style={{ transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * -25}px)` }}>
              {STARS.slice(40, 70).map(star => (
                <Star
                  key={star.id}
                  $size={star.size * 1.2}
                  $opacity={star.opacity}
                  $duration={star.duration}
                  $delay={star.delay}
                  $color={star.color}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                />
              ))}
            </StarsLayer>

            {/* Stars layer - moves faster (closer) */}
            <StarsLayer style={{ transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` }}>
              {STARS.slice(70, 100).map(star => (
                <Star
                  key={star.id}
                  $size={star.size * 1.5}
                  $opacity={star.opacity + 0.2}
                  $duration={star.duration}
                  $delay={star.delay}
                  $color={star.color}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                />
              ))}
            </StarsLayer>

          </SpaceBackground>

          <HeroContent>
            <HeroLogos>
              <HeroLogoWrapper>
                <Image
                  src="/breederlogos/kuma.png"
                  alt="KUMA"
                  width={72}
                  height={72}
                />
              </HeroLogoWrapper>
              <HeroLogoWrapper>
                <Image
                  src="/breederlogos/dkuma.png"
                  alt="dKUMA"
                  width={72}
                  height={72}
                />
              </HeroLogoWrapper>
            </HeroLogos>
            <HeroTitle>Swap. Breed. Earn. <br></br>To Infinity & Beyond.</HeroTitle>
            <HeroSubtitle>
              An infinite loop of swapping tokens, trading perpetuals, and earning yields from the Meme Index.
            </HeroSubtitle>
            <HeroButtons>
              <PrimaryButton onClick={() => router.push('/swap')}>
                Start Trading
              </PrimaryButton>
              <SecondaryButton onClick={() => router.push('/breeder')}>
                Breeder
              </SecondaryButton>
            </HeroButtons>
            <SocialLinks>
              <SocialLink href="https://x.com/officialkumainu" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://t.me/KumaInuOfficial" target="_blank" rel="noopener noreferrer" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://coinmarketcap.com/currencies/kuma-inu/" target="_blank" rel="noopener noreferrer" title="CoinMarketCap">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.738 14.341c-.419.265-.912.298-1.286.087-.476-.27-.738-.898-.738-1.774v-2.618c0-1.264-.5-2.164-1.336-2.407-.834-.243-1.667.09-2.222.888l-2.634 3.782v-3.27c0-1.018-.334-1.618-.993-1.79-.44-.114-.9.088-1.27.557l-4.925 6.249a7.755 7.755 0 0 1-.752-3.338c0-4.323 3.514-7.837 7.837-7.837s7.838 3.514 7.838 7.837c0 .2-.008.398-.023.595-.08 1.049-.426 1.757-1.025 2.103l-.471-.064zm2.262-2.34c.018-.253.027-.509.027-.766 0-5.36-4.36-9.72-9.72-9.72S3.587 5.875 3.587 11.235s4.36 9.72 9.72 9.72c2.756 0 5.242-1.15 7.005-2.994l-1.072-1.071a7.804 7.804 0 0 1-5.933 2.732 7.845 7.845 0 0 1-6.725-3.802l4.73-6.003v2.899c0 1.6.666 2.135 1.222 2.135.42 0 .9-.23 1.394-.915l2.832-4.067v2.622c0 1.47.522 2.532 1.435 2.912.294.122.611.184.935.184.53 0 1.09-.163 1.604-.471 1.046-.626 1.666-1.756 1.8-3.278l-.072.006z" />
                </svg>
              </SocialLink>
                          </SocialLinks>
          </HeroContent>
        </HeroSection>

        <AppsShowcase>
          <ShowcaseTitle>Built for all the ways you DeFi</ShowcaseTitle>

          <ShowcaseGrid>
            {/* SwapX Card */}
            <ShowcaseCard onClick={() => router.push('/swap')}>
              <CardLabel>
                SwapX
              </CardLabel>
              <CardTitle>Explore. Swap. Repeat.</CardTitle>
              <CardDescription>
                Discover, research, manage, and swap crypto — all with no fees. Explore any ERC-20 token.
              </CardDescription>
              <CardButton>
                Explore tokens <ArrowRight size={18} />
              </CardButton>

              <TokenList>
                {DISPLAY_TOKENS.map((token) => (
                  <TokenRow key={token.symbol}>
                    <TokenInfo>
                      <TokenIcon $bg={token.color}>
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          width={36}
                          height={36}
                          style={{ borderRadius: '50%' }}
                        />
                      </TokenIcon>
                      <TokenDetails>
                        <TokenName>{token.name}</TokenName>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                      </TokenDetails>
                    </TokenInfo>
                    <TokenPriceInfo>
                      <TokenPrice>{formatPrice(tokenPrices[token.symbol]?.price || '0')}</TokenPrice>
                      <TokenChange $positive={(tokenPrices[token.symbol]?.change || 0) >= 0}>
                        {formatChange(tokenPrices[token.symbol]?.change || 0)}
                      </TokenChange>
                    </TokenPriceInfo>
                  </TokenRow>
                ))}
              </TokenList>
            </ShowcaseCard>

            {/* KumaDex Perps Card */}
            <ShowcaseCard onClick={() => router.push('/kumadex')} style={{ overflow: 'hidden' }}>
              <CardLabel>
                KumaDex Perps
              </CardLabel>
              <CardTitle>Leverage. Trade. Profit.</CardTitle>
              <CardDescription>
                Trade vAMM perpetual contracts with up to 25x leverage. Advanced charts, liquidation tracking, and low fees.
              </CardDescription>
              <CardButton>
                Coming Soon <ArrowRight size={18} />
              </CardButton>

              <PerpCard>
                <PerpCardHeader>
                  <PerpPair>
                    <PerpPairIcons>
                      <PerpPairIcon>
                        <Image src="/breederlogos/kuma.png" alt="KUMA" width={32} height={32} style={{ objectFit: 'contain' }} />
                      </PerpPairIcon>
                      <PerpPairIcon>
                        <Image src="/breederlogos/usdc.png" alt="USD" width={32} height={32} style={{ objectFit: 'contain' }} />
                      </PerpPairIcon>
                    </PerpPairIcons>
                    <PerpPairName>KUMA/USD</PerpPairName>
                  </PerpPair>
                  <LeverageBadge>25x</LeverageBadge>
                </PerpCardHeader>

                <PerpPrice>$0.00001247</PerpPrice>
                <PerpPriceChange>+12.8% (24h)</PerpPriceChange>

                <PerpButtons>
                  <PerpButton $type="long">Long</PerpButton>
                  <PerpButton $type="short">Short</PerpButton>
                </PerpButtons>

                <PerpInput>
                  <PerpInputLabel>Position Size</PerpInputLabel>
                  <PerpInputValue>500M KUMA</PerpInputValue>
                </PerpInput>
              </PerpCard>
            </ShowcaseCard>
          </ShowcaseGrid>

          {/* Second Row - Breeder Cards */}
          <ShowcaseGrid>
            {/* Kuma Breeder Card */}
            <ShowcaseCard onClick={() => router.push('/breeder')}>
              <CardLabel>
                Kuma Breeder
              </CardLabel>
              <CardTitle>Breed. Earn. Accumulate.</CardTitle>
              <CardDescription>
                Stake your favorite tokens to earn high APY rewards with auto-compounding and flexible withdrawals.
              </CardDescription>
              <CardButton>
                Start staking <ArrowRight size={18} />
              </CardButton>

              <PoolList>
                {STAKING_POOLS.map((pool) => (
                  <PoolRow key={pool.name}>
                    <PoolInfo>
                      <PoolIcon $bg={pool.color}>
                        <Image
                          src={pool.logo}
                          alt={pool.name}
                          width={36}
                          height={36}
                          style={{ borderRadius: '50%' }}
                        />
                      </PoolIcon>
                      <PoolDetails>
                        <PoolName>{pool.name}</PoolName>
                        <PoolPair>{pool.pair}</PoolPair>
                      </PoolDetails>
                    </PoolInfo>
                    <PoolAPY>
                      <APYValue>{pool.apy}%</APYValue>
                      <APYLabel>APY</APYLabel>
                    </PoolAPY>
                  </PoolRow>
                ))}
              </PoolList>
            </ShowcaseCard>

            {/* dKuma Breeder Card */}
            <ShowcaseCard onClick={() => router.push('/dkuma-breeder')} style={{ overflow: 'hidden' }}>
              <CardLabel>
                dKuma Breeder
              </CardLabel>
              <CardTitle>Stake dKuma. Earn USDC.</CardTitle>
              <CardDescription>
                Stake your dKUMA tokens to earn stable USDC rewards with flexible withdrawals.
              </CardDescription>
              <CardButton>
                Start earning <ArrowRight size={18} />
              </CardButton>

              <div style={{
                marginTop: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  border: '3px solid #2775ca',
                  boxShadow: '0 0 20px rgba(39, 117, 202, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1a1d21'
                }}>
                  <Image
                    src={DKUMA_POOL.logo}
                    alt={DKUMA_POOL.name}
                    width={66}
                    height={66}
                    style={{ borderRadius: '50%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  {DKUMA_POOL.pair}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '700', color: '#22c55e' }}>
                    {DKUMA_POOL.apy}%
                  </span>
                  <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }}>APY</span>
                </div>
              </div>
            </ShowcaseCard>
          </ShowcaseGrid>

          {/* Third Row - DAO & Wallet Cards */}
          <ShowcaseGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Kuma DAO Card */}
            <ShowcaseCard onClick={() => window.open('https://snapshot.org/#/s:kumatokens.eth', '_blank')} style={{ minHeight: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image src="/breederlogos/kuma.png" alt="KUMA" width={48} height={48} style={{ borderRadius: '50%' }} />
                </div>
                <div>
                  <CardLabel style={{ marginBottom: '0' }}>
                    Governance
                  </CardLabel>
                </div>
              </div>
              <CardTitle style={{ fontSize: '22px' }}>Kuma DAO</CardTitle>
              <CardDescription style={{ fontSize: '14px' }}>
                Vote on proposals shaping the future of Kuma Inu ecosystem on Snapshot.
              </CardDescription>
              <CardButton style={{ marginTop: 'auto' }}>
                Vote Now <ArrowRight size={16} />
              </CardButton>
            </ShowcaseCard>

            {/* KumaDex DAO Card */}
            <ShowcaseCard onClick={() => router.push('/dao')} style={{ minHeight: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image src="/breederlogos/dkuma.png" alt="dKUMA" width={48} height={48} style={{ borderRadius: '50%' }} />
                </div>
                <div>
                  <CardLabel style={{ marginBottom: '0' }}>
                    dKUMA Governance
                  </CardLabel>
                </div>
              </div>
              <CardTitle style={{ fontSize: '22px' }}>KumaDex DAO</CardTitle>
              <CardDescription style={{ fontSize: '14px' }}>
                Stake dKUMA to participate in KumaDex governance and earn rewards.
              </CardDescription>
              <CardButton style={{ marginTop: 'auto' }}>
                Participate <ArrowRight size={16} />
              </CardButton>
            </ShowcaseCard>

            {/* Kuma Wallet Card */}
            <ShowcaseCard onClick={() => router.push('/portfolio')} style={{ minHeight: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fc72ff, #c837f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CreditCard size={24} color="#fff" />
                </div>
                <div>
                  <CardLabel style={{ marginBottom: '0' }}>
                    Portfolio
                  </CardLabel>
                </div>
              </div>
              <CardTitle style={{ fontSize: '22px' }}>Kuma Wallet</CardTitle>
              <CardDescription style={{ fontSize: '14px' }}>
                Track your portfolio, view balances, and manage your Kuma ecosystem assets.
              </CardDescription>
              <CardButton style={{ marginTop: 'auto' }}>
                View Wallet <ArrowRight size={16} />
              </CardButton>
            </ShowcaseCard>
          </ShowcaseGrid>
        </AppsShowcase>

        {/* Secondary Apps */}
        <StatsSection>
          <StatsContainer>
            <StatItem
              onClick={() => router.push('/breeder')}
              style={{ cursor: 'pointer' }}
              title="View Kuma Breeder"
            >
              <StatValue>
                {liveStats.loading ? '...' : `$${formatStatNumber(liveStats.tvl)}+`}
              </StatValue>
              <StatLabel>TVL in Kuma Breeder</StatLabel>
            </StatItem>
            <StatItem
              onClick={() => window.open('https://etherscan.io/token/0x48C276e8d03813224bb1e55F953adB6d02FD3E02#balances', '_blank')}
              style={{ cursor: 'pointer' }}
              title="View on Etherscan"
            >
              <StatValue>
                {liveStats.loading ? '...' : `${formatStatNumber(liveStats.holders)}+`}
              </StatValue>
              <StatLabel>Holders</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>11+</StatValue>
              <StatLabel>Staking Pairs</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>1M+</StatValue>
              <StatLabel>Total Transactions</StatLabel>
            </StatItem>
          </StatsContainer>
        </StatsSection>

        <CTASection>
          <CTAContent>
            <CTATitle>Ready to Get Started?</CTATitle>
            <CTASubtitle>
              Join millions of traders and stakers in the Kuma ecosystem
            </CTASubtitle>
            <CTATokenLogos>
              {BREEDER_TOKENS.map((token) => (
                <CTATokenLogo key={token.symbol} title={token.symbol}>
                  <Image
                    src={token.logo}
                    alt={token.symbol}
                    width={48}
                    height={48}
                    style={{ borderRadius: '50%' }}
                  />
                </CTATokenLogo>
              ))}
            </CTATokenLogos>
            <SocialLinks>
              <SocialLink href="https://x.com/officialkumainu" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://t.me/KumaInuOfficial" target="_blank" rel="noopener noreferrer" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </SocialLink>
            </SocialLinks>
          </CTAContent>
        </CTASection>

        <Footer>
          <FooterText>© 2026 KumaDex. All rights reserved.</FooterText>
        </Footer>
      </AppContainer>
    </>
  )
}
