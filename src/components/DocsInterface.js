import { useState } from 'react'
import styled from 'styled-components'
import { ChevronRight, ChevronDown, Book, Home, Users, DollarSign, Target, Code, MapPin, ExternalLink, HelpCircle, FileText, Layers, Shield, Zap, TrendingUp, Award, Globe, GitHub, Twitter, MessageCircle } from 'react-feather'

const DocsContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: calc(100vh - 80px);
  background: #fafbfc;
  color: #1f2328;
`

const Sidebar = styled.div`
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #d0d7de;
  padding: 24px 0;
  overflow-y: auto;
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);

  @media (max-width: 768px) {
    display: ${props => props.open ? 'block' : 'none'};
    position: fixed;
    top: 80px;
    left: 0;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
`

const SidebarSection = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #656d76;
  padding: 0 20px 8px 20px;
  letter-spacing: 0.5px;
`

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: ${props => props.active ? '#0969da' : '#1f2328'};
  background: ${props => props.active ? '#dbeafe' : 'transparent'};

  &:hover {
    background: #f6f8fa;
    color: #0969da;
  }

  svg {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }
`

const SubNavItem = styled(NavItem)`
  padding-left: 44px;
  font-size: 13px;
  color: ${props => props.active ? '#0969da' : '#656d76'};
`

const Content = styled.div`
  flex: 1;
  padding: 40px 48px;
  max-width: 900px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`

const ContentSection = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 600;
  color: #1f2328;
  margin: 0 0 16px 0;
  line-height: 1.2;
`

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #656d76;
  margin: 0 0 32px 0;
  line-height: 1.5;
`

const SectionHeading = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1f2328;
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #d0d7de;
`

const SubsectionHeading = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2328;
  margin: 24px 0 12px 0;
`

const Paragraph = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: #1f2328;
  margin: 0 0 16px 0;
`

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 90px;
  left: 20px;
  z-index: 1001;
  background: #0969da;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
`

const FeatureCard = styled.div`
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0969da;
    box-shadow: 0 4px 12px rgba(9, 105, 218, 0.1);
  }
`

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff8502 0%, #ff6b00 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 16px;
`

const FeatureTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #1f2328;
  margin: 0 0 8px 0;
`

const FeatureDescription = styled.p`
  font-size: 14px;
  color: #656d76;
  margin: 0;
  line-height: 1.5;
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 24px 0;
`

const StatCard = styled.div`
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3145 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #ff8502;
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: #a0a0a0;
`

const AddressTable = styled.div`
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
`

const AddressRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #d0d7de;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f6f8fa;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`

const AddressLabel = styled.span`
  font-weight: 600;
  color: #1f2328;
  font-size: 14px;
`

const AddressValue = styled.a`
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  color: #0969da;
  text-decoration: none;
  background: #f6f8fa;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: #dbeafe;
    text-decoration: underline;
  }
`

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
`

const LinkCard = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  padding: 16px 20px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0969da;
    box-shadow: 0 4px 12px rgba(9, 105, 218, 0.1);
    transform: translateY(-2px);
  }
`

const LinkIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.bg || '#f6f8fa'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#1f2328'};
`

const LinkText = styled.div`
  flex: 1;
`

const LinkTitle = styled.div`
  font-weight: 600;
  color: #1f2328;
  font-size: 15px;
`

const LinkSubtitle = styled.div`
  font-size: 13px;
  color: #656d76;
`

const FAQItem = styled.div`
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
`

const FAQQuestion = styled.div`
  padding: 16px 20px;
  font-weight: 600;
  color: #1f2328;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #f6f8fa;
  }
`

const FAQAnswer = styled.div`
  padding: ${props => props.open ? '0 20px 16px 20px' : '0 20px'};
  max-height: ${props => props.open ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: #656d76;
  line-height: 1.6;
`

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 30px;
  margin: 24px 0;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #ff8502, #0969da);
  }
`

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 24px;

  &::before {
    content: '';
    position: absolute;
    left: -26px;
    top: 4px;
    width: 12px;
    height: 12px;
    background: ${props => props.completed ? '#ff8502' : '#d0d7de'};
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 2px ${props => props.completed ? '#ff8502' : '#d0d7de'};
  }
`

const TimelineTitle = styled.div`
  font-weight: 600;
  color: #1f2328;
  margin-bottom: 4px;
`

const TimelineDescription = styled.div`
  font-size: 14px;
  color: #656d76;
  line-height: 1.5;
`

const TimelineDate = styled.span`
  font-size: 12px;
  color: #ff8502;
  font-weight: 500;
  margin-left: 8px;
`

const CalloutBox = styled.div`
  background: ${props => props.type === 'warning' ? '#fff8e6' : props.type === 'info' ? '#dbeafe' : '#f0fdf4'};
  border-left: 4px solid ${props => props.type === 'warning' ? '#f59e0b' : props.type === 'info' ? '#0969da' : '#22c55e'};
  border-radius: 0 8px 8px 0;
  padding: 16px 20px;
  margin: 16px 0;
`

const CalloutTitle = styled.div`
  font-weight: 600;
  color: #1f2328;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CalloutText = styled.div`
  font-size: 14px;
  color: #656d76;
  line-height: 1.5;
`

const TokenBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #ff8502 0%, #ff6b00 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
`

const BulletList = styled.ul`
  margin: 16px 0;
  padding-left: 24px;

  li {
    margin-bottom: 8px;
    line-height: 1.6;
    color: #1f2328;
  }
`

const CodeBlock = styled.pre`
  background: #1f2328;
  color: #e6edf3;
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  margin: 16px 0;
`

const DocsInterface = () => {
  const [activeSection, setActiveSection] = useState('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openFAQs, setOpenFAQs] = useState({})

  const toggleFAQ = (id) => {
    setOpenFAQs(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const sections = [
    {
      title: 'Getting Started',
      items: [
        { id: 'introduction', label: 'Introduction', icon: Home },
        { id: 'origin', label: 'Origin', icon: Book },
        { id: 'mission', label: 'Mission', icon: Target },
        { id: 'whitepaper', label: 'White Paper', icon: FileText }
      ]
    },
    {
      title: 'Ecosystem',
      items: [
        { id: 'governance', label: 'Governance', icon: Users },
        { id: 'treasury', label: 'Treasury', icon: DollarSign },
        { id: 'development', label: 'Development', icon: Code },
        { id: 'tokenomics', label: 'Tokenomics', icon: Layers }
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'links', label: 'Links', icon: ExternalLink },
        { id: 'faq', label: 'FAQ', icon: HelpCircle }
      ]
    },
    {
      title: 'Projects',
      items: [
        { id: 'kuma-breeder', label: 'Kuma Breeder', icon: null },
        { id: 'dkuma-breeder-staking', label: 'dKUMA Breeder Staking', icon: null },
        { id: 'kuma-dao', label: 'Kuma DAO', icon: null },
        { id: 'dkuma-dao', label: 'dKuma DAO', icon: null },
        { id: 'dkuma-token', label: 'dKUMA Token', icon: null },
        { id: 'vessel-vault', label: 'Vessel Vault', icon: null },
        { id: 'kumadex', label: 'KumaDex', icon: null }
      ]
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'introduction':
        return (
          <ContentSection active>
            <PageTitle>KumaDex Documentation</PageTitle>
            <PageSubtitle>The comprehensive guide to the Kuma Inu DeFi ecosystem</PageSubtitle>

            <Paragraph>
              KumaDex is a decentralized finance (DeFi) ecosystem built on Ethereum, designed to empower the Kuma Inu
              community with innovative yield farming, governance mechanisms, and trading solutions. At its core is
              the <strong>dKUMA Breeder</strong> - a revolutionary farming protocol that creates an infinite compounding
              loop, allowing participants to continuously grow their positions through strategic reinvestment.
            </Paragraph>

            <CalloutBox type="info">
              <CalloutTitle><Zap size={16} /> The Infinite Loop</CalloutTitle>
              <CalloutText>
                Stake tokens → Earn dKUMA → Add dKUMA-ETH liquidity → Stake LP → Earn more dKUMA → Repeat forever.
                The Kuma ecosystem is designed for perpetual compounding.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>The Infinite Compounding Loop</SectionHeading>

            <Paragraph>
              The Kuma ecosystem is architected around a self-reinforcing flywheel that rewards active participants
              with ever-growing yields. This isn't just staking - it's a <strong>perpetual value engine</strong> where
              every action feeds back into the system.
            </Paragraph>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>1</span></FeatureIcon>
                <FeatureTitle>Stake Your Assets</FeatureTitle>
                <FeatureDescription>
                  Deposit KUMA, LP tokens, or other supported assets into the dKUMA Breeder pools. Your tokens
                  immediately begin earning dKUMA rewards every block.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>2</span></FeatureIcon>
                <FeatureTitle>Harvest dKUMA</FeatureTitle>
                <FeatureDescription>
                  Claim your accumulated dKUMA rewards. At 100 dKUMA per block distributed across all pools,
                  rewards accumulate continuously 24/7.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>3</span></FeatureIcon>
                <FeatureTitle>Create dKUMA-ETH LP</FeatureTitle>
                <FeatureDescription>
                  Pair your harvested dKUMA with ETH on Uniswap to create dKUMA-ETH LP tokens. This provides
                  liquidity for dKUMA trading while positioning you for the next step.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>∞</span></FeatureIcon>
                <FeatureTitle>Stake LP, Repeat Forever</FeatureTitle>
                <FeatureDescription>
                  Stake your dKUMA-ETH LP back into the Breeder to earn even more dKUMA. The loop closes -
                  your rewards are now earning rewards. Compound infinitely.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>The dKUMA Breeder</SectionHeading>

            <Paragraph>
              The dKUMA Breeder is the heart of the Kuma ecosystem - a MasterChef-style yield farming contract
              that distributes <strong>100 dKUMA per Ethereum block</strong> across all active pools. Unlike simple
              staking protocols, the Breeder supports multiple entry points into the compounding loop:
            </Paragraph>

            <BulletList>
              <li><strong>KUMA Single Staking:</strong> Stake KUMA tokens directly to earn dKUMA - the simplest entry point</li>
              <li><strong>KUMA-ETH LP:</strong> Provide KUMA liquidity and stake LP tokens for higher APR</li>
              <li><strong>dKUMA-ETH LP:</strong> The compounding pool - stake your reward token's LP for recursive yields</li>
              <li><strong>Ecosystem Tokens:</strong> Stake SHIB, LEASH, AKITA, ELON and their LP pairs to earn dKUMA</li>
            </BulletList>

            <CalloutBox type="warning">
              <CalloutTitle><TrendingUp size={16} /> Compounding Strategy</CalloutTitle>
              <CalloutText>
                Maximum compounding: Harvest dKUMA → Create dKUMA-ETH LP → Stake LP → Repeat. Each cycle increases
                your share of the 100 dKUMA/block emissions. The earlier you start compounding, the larger your
                position grows relative to later entrants.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Ecosystem Flywheel</SectionHeading>

            <Paragraph>
              The infinite loop creates a powerful flywheel effect that benefits the entire ecosystem:
            </Paragraph>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
                <FeatureTitle>Growing Liquidity</FeatureTitle>
                <FeatureDescription>
                  As users compound dKUMA into LP positions, total liquidity for both KUMA and dKUMA deepens,
                  reducing slippage and improving trading experience for everyone.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Layers size={24} /></FeatureIcon>
                <FeatureTitle>Increasing TVL</FeatureTitle>
                <FeatureDescription>
                  Compounded positions mean more total value locked in the protocol, demonstrating ecosystem
                  health and attracting new participants.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Users size={24} /></FeatureIcon>
                <FeatureTitle>Aligned Incentives</FeatureTitle>
                <FeatureDescription>
                  Long-term compounders benefit most from ecosystem growth. The design naturally rewards
                  diamond hands over short-term speculation.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Shield size={24} /></FeatureIcon>
                <FeatureTitle>Sustainable Yields</FeatureTitle>
                <FeatureDescription>
                  Unlike ponzinomics that require constant new deposits, the Breeder's fixed emission rate
                  creates predictable, sustainable yields tied to real token utility.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Ecosystem Components</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Layers size={24} /></FeatureIcon>
                <FeatureTitle>dKUMA Breeder</FeatureTitle>
                <FeatureDescription>
                  The core yield farming protocol. Stake LP tokens and single assets across 10+ pools to earn
                  dKUMA rewards. Powers the infinite compounding loop.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Users size={24} /></FeatureIcon>
                <FeatureTitle>Kuma DAO</FeatureTitle>
                <FeatureDescription>
                  Decentralized governance for the Kuma ecosystem. KUMA token holders vote on pool allocations,
                  emission rates, treasury spending, and protocol upgrades.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Award size={24} /></FeatureIcon>
                <FeatureTitle>dKUMA Token</FeatureTitle>
                <FeatureDescription>
                  The reward token that makes the loop possible. Earned through staking, used to create LP
                  positions, and stakeable itself for recursive yields.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Shield size={24} /></FeatureIcon>
                <FeatureTitle>Vessel Vault</FeatureTitle>
                <FeatureDescription>
                  Advanced vault strategies with time-locked staking for boosted rewards. Lock longer,
                  earn more. Future auto-compounding features planned.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Key Metrics</SectionHeading>

            <StatGrid>
              <StatCard>
                <StatValue>100</StatValue>
                <StatLabel>dKUMA/Block</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>10+</StatValue>
                <StatLabel>Active Pools</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>∞</StatValue>
                <StatLabel>Compounding Loop</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>DAO</StatValue>
                <StatLabel>Governed</StatLabel>
              </StatCard>
            </StatGrid>

            <SectionHeading>Getting Started</SectionHeading>

            <Paragraph>
              Ready to enter the infinite loop? Here's how to start compounding:
            </Paragraph>

            <BulletList>
              <li><strong>Step 1:</strong> Connect your wallet and ensure you're on Ethereum Mainnet</li>
              <li><strong>Step 2:</strong> Acquire KUMA tokens via Uniswap or stake ecosystem tokens you already hold</li>
              <li><strong>Step 3:</strong> Visit the Breeder page and deposit into your chosen pool</li>
              <li><strong>Step 4:</strong> Watch your dKUMA rewards accumulate in real-time</li>
              <li><strong>Step 5:</strong> Harvest, create dKUMA-ETH LP, stake, and repeat</li>
            </BulletList>

            <CalloutBox type="info">
              <CalloutTitle><Zap size={16} /> Pro Tip</CalloutTitle>
              <CalloutText>
                Gas costs matter. Batch your harvesting and compounding during low gas periods to maximize
                returns. The higher your position, the more frequently it makes sense to compound.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'origin':
        return (
          <ContentSection active>
            <PageTitle>Origin</PageTitle>
            <PageSubtitle>The legendary story behind Kuma Inu - born from the ashes of Vitalik's SHIB dump</PageSubtitle>

            <Paragraph>
              Kuma Inu launched on <strong>May 12, 2021</strong> - the exact day that Vitalik Buterin dumped his
              Shiba Inu tokens, sending shockwaves through the meme coin ecosystem. While others panicked,
              Kuma Inu emerged as a phoenix from the chaos, representing a new chapter for dog-themed tokens
              with real utility and community ownership.
            </Paragraph>

            <CalloutBox type="warning">
              <CalloutTitle><Zap size={16} /> Historic Launch</CalloutTitle>
              <CalloutText>
                Kuma Inu was stealth launched with no presale, no team tokens, and no insider allocations.
                The KUMA deployer wallet was funded directly by the original Shiba Inu deployer, creating
                an on-chain connection to meme coin history.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>The $1 Million Burn</SectionHeading>
            <Paragraph>
              In an unprecedented display of commitment to the community, <strong>over $1,000,000 worth of KUMA
              tokens were burned forever</strong>, permanently removing them from circulation. This wasn't a
              marketing stunt - it was a statement. The burn demonstrated that Kuma Inu was built for long-term
              holders, not quick flips.
            </Paragraph>

            <StatGrid>
              <StatCard>
                <StatValue>$1M+</StatValue>
                <StatLabel>Burned Forever</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>May 12</StatValue>
                <StatLabel>2021 Launch</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>0</StatValue>
                <StatLabel>Team Tokens</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>100%</StatValue>
                <StatLabel>Community Owned</StatLabel>
              </StatCard>
            </StatGrid>

            <SectionHeading>Connected to History</SectionHeading>

            <SubsectionHeading>Funded by SHIB Deployer</SubsectionHeading>
            <Paragraph>
              The KUMA token deployer wallet received its initial funding directly from the original Shiba Inu
              deployer address. This on-chain provenance connects Kuma Inu to the very roots of the dog coin
              movement, establishing legitimacy that cannot be faked or replicated.
            </Paragraph>

            <SubsectionHeading>Stealth Launch Philosophy</SubsectionHeading>
            <Paragraph>
              Unlike projects that hype for months before launch, Kuma Inu was deployed without announcement.
              No influencer campaigns, no paid promotions, no Discord shilling before launch. The community
              discovered KUMA organically, and those early believers became the foundation of what exists today.
            </Paragraph>

            <CalloutBox type="info">
              <CalloutTitle><Shield size={16} /> Verified On-Chain</CalloutTitle>
              <CalloutText>
                Every claim about Kuma Inu's origin can be verified on Etherscan. The SHIB deployer funding,
                the token burns, the locked liquidity - it's all permanently recorded on the Ethereum blockchain.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Building Real Utility</SectionHeading>
            <Paragraph>
              While other meme coins remained purely speculative, Kuma Inu's community set out to build actual
              DeFi infrastructure. The KumaBreeder brought yield farming to KUMA holders. The DAO gave the
              community governance power. The Vessel Vault introduced advanced staking strategies. Each piece
              was built to provide lasting value, not just temporary hype.
            </Paragraph>

            <SectionHeading>Key Milestones</SectionHeading>
            <TimelineContainer>
              <TimelineItem completed>
                <TimelineTitle>Stealth Launch & $1M Burn <TimelineDate>May 12, 2021</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  KUMA deployed on the day of Vitalik's SHIB dump. Funded by SHIB deployer. Over $1M in tokens
                  burned to dead wallet, permanently removed from supply.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>Community Growth <TimelineDate>2021-2022</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Organic community expansion through word-of-mouth. Diamond hands formed during bear market.
                  Foundation laid for DeFi development.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>KumaBreeder Launch <TimelineDate>2022</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  First yield farming protocol deployed, allowing KUMA holders and LP providers to earn dKUMA rewards.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>dKUMA & Ecosystem Expansion <TimelineDate>2023</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Introduction of dKUMA reward token. Multiple staking pools added including SHIB, LEASH, AKITA,
                  and ELON ecosystem tokens.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>KumaDex Platform <TimelineDate>2024</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Full-featured DEX interface launched with integrated Breeder, DAO governance, Vessel Vault,
                  and portfolio tracking.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>Cross-Chain & L2 Expansion <TimelineDate>2025</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Planned deployment to Layer 2 networks for reduced gas costs and increased accessibility.
                </TimelineDescription>
              </TimelineItem>
            </TimelineContainer>

            <SectionHeading>The Kuma Legacy</SectionHeading>
            <Paragraph>
              Kuma Inu stands as proof that meme coins can evolve into legitimate DeFi ecosystems. Born from
              chaos, funded by history, and built by community - KUMA represents everything that crypto was
              meant to be: decentralized, transparent, and owned by the people who believe in it.
            </Paragraph>
          </ContentSection>
        )

      case 'mission':
        return (
          <ContentSection active>
            <PageTitle>Mission</PageTitle>
            <PageSubtitle>Our vision for the future of community-driven DeFi</PageSubtitle>

            <Paragraph>
              The Kuma ecosystem exists to demonstrate that community tokens can deliver real, sustainable value
              while maintaining the grassroots energy that makes them unique. We believe in building infrastructure
              that serves token holders first, with transparent governance and equitable reward distribution.
            </Paragraph>

            <SectionHeading>Core Principles</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Users size={24} /></FeatureIcon>
                <FeatureTitle>Community Governance</FeatureTitle>
                <FeatureDescription>
                  All major decisions are made through on-chain voting. No central authority can override the will
                  of token holders. One token, one vote.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Shield size={24} /></FeatureIcon>
                <FeatureTitle>Transparent Operations</FeatureTitle>
                <FeatureDescription>
                  All smart contracts are verified and open source. Treasury transactions are publicly visible.
                  No hidden allocations or insider deals.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
                <FeatureTitle>Sustainable Growth</FeatureTitle>
                <FeatureDescription>
                  Emission schedules and tokenomics designed for long-term value accrual, not short-term pumps.
                  Building for years, not quarters.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Zap size={24} /></FeatureIcon>
                <FeatureTitle>Innovation</FeatureTitle>
                <FeatureDescription>
                  Continuously developing new DeFi primitives and tools that benefit the ecosystem. From yield
                  optimization to novel governance mechanisms.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Strategic Goals</SectionHeading>

            <BulletList>
              <li><strong>Expand Liquidity:</strong> Grow protocol-owned liquidity across multiple DEXs to ensure deep markets and minimal slippage for traders.</li>
              <li><strong>Enhance Utility:</strong> Develop new use cases for KUMA and dKUMA tokens beyond speculation, including governance rights, fee sharing, and exclusive access.</li>
              <li><strong>Build Partnerships:</strong> Collaborate with other DeFi protocols to integrate Kuma ecosystem tokens and expand reach.</li>
              <li><strong>Improve UX:</strong> Continuously iterate on the KumaDex interface to make DeFi accessible to newcomers while powerful for advanced users.</li>
              <li><strong>Scale Infrastructure:</strong> Expand to Layer 2 solutions to reduce gas costs and increase accessibility for smaller holders.</li>
            </BulletList>
          </ContentSection>
        )

      case 'whitepaper':
        return (
          <ContentSection active>
            <PageTitle>White Paper</PageTitle>
            <PageSubtitle>Technical specification and economic design of the Kuma ecosystem</PageSubtitle>

            <div style={{ marginBottom: '32px' }}>
              <a
                href="/kuma_whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #fc72ff 0%, #7289ff 100%)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <FileText size={18} />
                View Full Whitepaper (PDF)
              </a>
            </div>

            <SectionHeading>Abstract</SectionHeading>
            <Paragraph>
              The Kuma ecosystem presents a sustainable DeFi framework built around community-owned liquidity,
              transparent governance, and equitable reward distribution. This document outlines the technical
              architecture, tokenomics, and governance mechanisms that power the protocol.
            </Paragraph>

            <SectionHeading>1. Token Architecture</SectionHeading>

            <SubsectionHeading>1.1 KUMA Token</SubsectionHeading>
            <Paragraph>
              KUMA is the primary governance and utility token of the ecosystem. It represents voting power in the
              DAO and can be staked in the Breeder to earn dKUMA rewards. KUMA follows the ERC-20 standard with
              fixed maximum supply.
            </Paragraph>

            <SubsectionHeading>1.2 dKUMA Token</SubsectionHeading>
            <Paragraph>
              dKUMA (Distributed KUMA) is the reward token emitted through the KumaBreeder contract. It represents
              yield farming rewards and is designed to incentivize liquidity provision and long-term staking.
            </Paragraph>

            <CodeBlock>
{`// dKUMA Emission Rate
sushiPerBlock = 100 dKUMA
blocksPerYear = 2,628,000
yearlyEmission = 262,800,000 dKUMA`}
            </CodeBlock>

            <SectionHeading>2. KumaBreeder Mechanics</SectionHeading>

            <Paragraph>
              The KumaBreeder contract implements a modified MasterChef staking mechanism with the following features:
            </Paragraph>

            <BulletList>
              <li><strong>Allocation Points:</strong> Each pool receives a share of block rewards proportional to its allocation points divided by total allocation points.</li>
              <li><strong>Pool Types:</strong> Supports both LP token staking and single-sided token staking.</li>
              <li><strong>Pending Rewards:</strong> Users can view and claim accrued rewards at any time.</li>
              <li><strong>Emergency Withdraw:</strong> Safety mechanism allowing users to exit positions without claiming rewards.</li>
            </BulletList>

            <SubsectionHeading>2.1 Reward Calculation</SubsectionHeading>
            <CodeBlock>
{`// APR Calculation Formula
poolShare = allocPoint / totalAllocPoint
yearlyRewards = sushiPerBlock × blocksPerYear × poolShare
apr = (yearlyRewards × dkumaPrice / tvl) × 100`}
            </CodeBlock>

            <SectionHeading>3. Governance Framework</SectionHeading>

            <Paragraph>
              The Kuma DAO operates through a proposal-based governance system where KUMA holders can submit and
              vote on protocol changes. The governance process follows these stages:
            </Paragraph>

            <BulletList>
              <li><strong>Discussion:</strong> Community members discuss potential changes in governance forums.</li>
              <li><strong>Proposal:</strong> Formal proposals are submitted on-chain with specific parameters.</li>
              <li><strong>Voting:</strong> Token holders vote during a defined voting period.</li>
              <li><strong>Execution:</strong> Approved proposals are executed via timelock for safety.</li>
            </BulletList>

            <SectionHeading>4. Treasury Management</SectionHeading>

            <Paragraph>
              The protocol treasury is managed by the DAO through multi-signature controls and transparent
              on-chain governance. Treasury funds are allocated to:
            </Paragraph>

            <BulletList>
              <li>Development grants and bounties</li>
              <li>Liquidity incentives and market making</li>
              <li>Security audits and bug bounties</li>
              <li>Community initiatives and marketing</li>
              <li>Operational expenses and infrastructure</li>
            </BulletList>

            <SectionHeading>5. Security Model</SectionHeading>

            <Paragraph>
              All smart contracts in the Kuma ecosystem follow security best practices:
            </Paragraph>

            <BulletList>
              <li>OpenZeppelin standard implementations where applicable</li>
              <li>Multi-sig controls on critical functions</li>
              <li>Timelock delays on governance execution</li>
              <li>Verified and open source contracts on Etherscan</li>
              <li>Continuous monitoring and incident response procedures</li>
            </BulletList>

            <CalloutBox type="warning">
              <CalloutTitle><Shield size={16} /> Security Notice</CalloutTitle>
              <CalloutText>
                While we implement best practices, all DeFi protocols carry inherent risks. Never invest more than
                you can afford to lose, and always verify contract addresses before interacting.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'governance':
        return (
          <ContentSection active>
            <PageTitle>Governance</PageTitle>
            <PageSubtitle>How decisions are made in the Kuma ecosystem</PageSubtitle>

            <Paragraph>
              The Kuma DAO is a decentralized autonomous organization that governs the Kuma ecosystem. All major
              protocol decisions, from treasury allocations to smart contract upgrades, are made through community
              voting. This ensures that the protocol remains truly decentralized and community-owned.
            </Paragraph>

            <CalloutBox type="info">
              <CalloutTitle><Users size={16} /> Governance Power</CalloutTitle>
              <CalloutText>
                Your voting power is determined by your KUMA token holdings. 1 KUMA = 1 vote on all proposals.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Governance Process</SectionHeading>

            <SubsectionHeading>Phase 1: Discussion</SubsectionHeading>
            <Paragraph>
              All proposals begin as discussions in the community forums. This allows ideas to be refined and
              gather community feedback before formal submission. Active participation at this stage helps
              shape proposals into actionable improvements.
            </Paragraph>

            <SubsectionHeading>Phase 2: Proposal Submission</SubsectionHeading>
            <Paragraph>
              Once a proposal has been refined through discussion, it can be submitted on-chain. Proposals must
              include clear specifications, implementation details, and any relevant code or parameter changes.
            </Paragraph>

            <SubsectionHeading>Phase 3: Voting Period</SubsectionHeading>
            <Paragraph>
              Active proposals enter a voting period during which KUMA holders can cast their votes. Votes can
              typically be cast as For, Against, or Abstain. The voting period allows sufficient time for all
              stakeholders to participate.
            </Paragraph>

            <SubsectionHeading>Phase 4: Execution</SubsectionHeading>
            <Paragraph>
              Proposals that meet the required quorum and approval threshold are queued for execution. A timelock
              period provides a safety window before changes take effect, allowing users to react if needed.
            </Paragraph>

            <SectionHeading>Types of Proposals</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureTitle>Protocol Parameters</FeatureTitle>
                <FeatureDescription>
                  Changes to emission rates, allocation points, pool fees, and other protocol parameters.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureTitle>Treasury Allocations</FeatureTitle>
                <FeatureDescription>
                  Requests for funding from the protocol treasury for development, marketing, or community initiatives.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureTitle>Smart Contract Upgrades</FeatureTitle>
                <FeatureDescription>
                  Deployment of new contracts or upgrades to existing protocol infrastructure.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureTitle>Partnership Proposals</FeatureTitle>
                <FeatureDescription>
                  Integration with other protocols, token listings, or strategic partnerships.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Governance Parameters</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>Voting Period</AddressLabel>
                <AddressValue as="span">3-7 days (proposal dependent)</AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Quorum Requirement</AddressLabel>
                <AddressValue as="span">4% of total supply</AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Approval Threshold</AddressLabel>
                <AddressValue as="span">&gt;50% of votes cast</AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Timelock Delay</AddressLabel>
                <AddressValue as="span">24-48 hours</AddressValue>
              </AddressRow>
            </AddressTable>
          </ContentSection>
        )

      case 'treasury':
        return (
          <ContentSection active>
            <PageTitle>Treasury</PageTitle>
            <PageSubtitle>Management and allocation of ecosystem funds</PageSubtitle>

            <Paragraph>
              The Kuma Treasury holds protocol-owned assets that fund ecosystem development, liquidity incentives,
              and community initiatives. All treasury management is conducted transparently through DAO governance,
              with multi-signature controls ensuring security.
            </Paragraph>

            <SectionHeading>Treasury Composition</SectionHeading>

            <Paragraph>
              The treasury holds a diversified portfolio of assets including:
            </Paragraph>

            <BulletList>
              <li><strong>ETH:</strong> Native Ethereum for gas costs and operational expenses</li>
              <li><strong>KUMA:</strong> Protocol tokens for liquidity incentives and grants</li>
              <li><strong>dKUMA:</strong> Reward tokens for strategic reserves</li>
              <li><strong>LP Tokens:</strong> Protocol-owned liquidity positions</li>
              <li><strong>Stablecoins:</strong> USDC/DAI for stable operational funding</li>
            </BulletList>

            <SectionHeading>Allocation Categories</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Code size={24} /></FeatureIcon>
                <FeatureTitle>Development (40%)</FeatureTitle>
                <FeatureDescription>
                  Funding for smart contract development, security audits, frontend improvements, and technical
                  infrastructure.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
                <FeatureTitle>Liquidity (30%)</FeatureTitle>
                <FeatureDescription>
                  Protocol-owned liquidity, market making, and liquidity mining incentives across DEXs.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Users size={24} /></FeatureIcon>
                <FeatureTitle>Community (20%)</FeatureTitle>
                <FeatureDescription>
                  Grants, bounties, educational content, community events, and contributor rewards.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Shield size={24} /></FeatureIcon>
                <FeatureTitle>Reserves (10%)</FeatureTitle>
                <FeatureDescription>
                  Emergency reserves for unexpected expenses, security incidents, or strategic opportunities.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Transparency</SectionHeading>

            <Paragraph>
              All treasury transactions are publicly visible on-chain. The community can monitor treasury
              activity through block explorers and dedicated treasury dashboards. Quarterly reports summarize
              spending and provide projections for sustainable operations.
            </Paragraph>

            <CalloutBox type="info">
              <CalloutTitle><Shield size={16} /> Multi-Sig Security</CalloutTitle>
              <CalloutText>
                Treasury funds are protected by a multi-signature wallet requiring multiple signers to approve
                transactions. Signers are elected community members with proven track records.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Requesting Funds</SectionHeading>

            <Paragraph>
              Community members can request treasury funding through the governance process:
            </Paragraph>

            <BulletList>
              <li>Submit a detailed proposal outlining the initiative and funding requirements</li>
              <li>Include milestones, deliverables, and success metrics</li>
              <li>Specify the requested amount and payment schedule</li>
              <li>Engage with community feedback during the discussion phase</li>
              <li>If approved, funds are released according to the proposal terms</li>
            </BulletList>
          </ContentSection>
        )

      case 'development':
        return (
          <ContentSection active>
            <PageTitle>Development</PageTitle>
            <PageSubtitle>Technical development and roadmap</PageSubtitle>

            <Paragraph>
              The Kuma ecosystem is under active development with a focus on security, user experience, and
              expanding protocol capabilities. Our development process is transparent, with code published
              openly and community input welcomed.
            </Paragraph>

            <SectionHeading>Development Roadmap</SectionHeading>

            <TimelineContainer>
              <TimelineItem completed>
                <TimelineTitle>Core Infrastructure <TimelineDate>Completed</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  KumaBreeder V2 deployment, dKUMA token launch, and base protocol contracts.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>KumaDex Frontend <TimelineDate>Completed</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Modern web interface for interacting with protocol contracts, including swap, breeder, and portfolio views.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem completed>
                <TimelineTitle>DAO Governance <TimelineDate>Completed</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  On-chain governance system with proposal creation, voting, and execution functionality.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>Vessel Vault V2 <TimelineDate>Q1 2025</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Enhanced vault strategies with auto-compounding and optimized yield generation.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>Layer 2 Deployment <TimelineDate>Q2 2025</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Expansion to Arbitrum and/or Base for reduced gas costs and improved accessibility.
                </TimelineDescription>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>Cross-Chain Bridge <TimelineDate>Q3 2025</TimelineDate></TimelineTitle>
                <TimelineDescription>
                  Native bridge for moving KUMA and dKUMA between supported networks.
                </TimelineDescription>
              </TimelineItem>
            </TimelineContainer>

            <SectionHeading>Contributing</SectionHeading>

            <Paragraph>
              The Kuma ecosystem welcomes contributions from developers worldwide. Whether you're interested in
              smart contract development, frontend engineering, or documentation, there are opportunities to
              contribute and earn rewards.
            </Paragraph>

            <SubsectionHeading>Ways to Contribute</SubsectionHeading>
            <BulletList>
              <li><strong>Bug Reports:</strong> Report issues through our GitHub repository</li>
              <li><strong>Feature Development:</strong> Submit pull requests for new features or improvements</li>
              <li><strong>Security Research:</strong> Participate in our bug bounty program</li>
              <li><strong>Documentation:</strong> Improve guides, tutorials, and technical documentation</li>
              <li><strong>Community Support:</strong> Help other users in Discord and governance forums</li>
            </BulletList>

            <SectionHeading>Tech Stack</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureTitle>Smart Contracts</FeatureTitle>
                <FeatureDescription>
                  Solidity 0.8.x, Hardhat, OpenZeppelin
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Frontend</FeatureTitle>
                <FeatureDescription>
                  Next.js, React, styled-components, Web3.js
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Infrastructure</FeatureTitle>
                <FeatureDescription>
                  IPFS, The Graph, Ethereum Mainnet
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Testing</FeatureTitle>
                <FeatureDescription>
                  Foundry, Hardhat Tests, Slither
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </ContentSection>
        )

      case 'tokenomics':
        return (
          <ContentSection active>
            <PageTitle>Tokenomics</PageTitle>
            <PageSubtitle>Understanding the KUMA and dKUMA token economics</PageSubtitle>

            <SectionHeading>KUMA Token</SectionHeading>

            <Paragraph>
              KUMA is the primary token of the ecosystem, serving as the governance token and primary staking asset.
              It was launched with a fair distribution model and no pre-mine or VC allocation.
            </Paragraph>

            <StatGrid>
              <StatCard>
                <StatValue>1T</StatValue>
                <StatLabel>Max Supply</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>ERC-20</StatValue>
                <StatLabel>Token Standard</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>18</StatValue>
                <StatLabel>Decimals</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>ETH</StatValue>
                <StatLabel>Network</StatLabel>
              </StatCard>
            </StatGrid>

            <SubsectionHeading>KUMA Utility</SubsectionHeading>
            <BulletList>
              <li><strong>Governance:</strong> Vote on protocol proposals and parameter changes</li>
              <li><strong>Staking:</strong> Stake in the Breeder to earn dKUMA rewards</li>
              <li><strong>Liquidity:</strong> Provide liquidity in KUMA-ETH pools for trading fees + farming rewards</li>
            </BulletList>

            <SectionHeading>dKUMA Token</SectionHeading>

            <Paragraph>
              dKUMA is the reward token distributed through the KumaBreeder contract. It represents yield farming
              rewards and has its own trading pairs on decentralized exchanges.
            </Paragraph>

            <SubsectionHeading>Emission Schedule</SubsectionHeading>
            <Paragraph>
              dKUMA is emitted at a rate of 100 tokens per Ethereum block, distributed across all active pools
              proportional to their allocation points.
            </Paragraph>

            <CodeBlock>
{`Emission Rate: 100 dKUMA per block
Blocks per Year: ~2,628,000
Annual Emission: ~262,800,000 dKUMA

Pool Distribution = (poolAllocPoint / totalAllocPoint) × emissionPerBlock`}
            </CodeBlock>

            <SubsectionHeading>dKUMA Utility</SubsectionHeading>
            <BulletList>
              <li><strong>Trading:</strong> Trade on Uniswap and other DEXs</li>
              <li><strong>Liquidity Mining:</strong> Provide dKUMA-ETH liquidity for additional rewards</li>
              <li><strong>Future Governance:</strong> Planned voting rights in dKUMA-specific proposals</li>
            </BulletList>

            <CalloutBox type="info">
              <CalloutTitle><TrendingUp size={16} /> Price Discovery</CalloutTitle>
              <CalloutText>
                Both KUMA and dKUMA prices are determined by open market trading on decentralized exchanges.
                The protocol does not control or manipulate token prices.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'addresses':
        return (
          <ContentSection active>
            <PageTitle>Contract Addresses</PageTitle>
            <PageSubtitle>Official smart contract addresses for all KumaDex protocols</PageSubtitle>

            <CalloutBox type="warning">
              <CalloutTitle><Shield size={16} /> Verify Before Interacting</CalloutTitle>
              <CalloutText>
                Always verify contract addresses before interacting. Bookmark this page and cross-reference
                addresses from official sources to protect against phishing.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Core Contracts</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>KUMA Token</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x48c276e8d03813224bb1e55f953adb6d02fd3e02" target="_blank" rel="noopener noreferrer">
                  0x48c276e8d03813224bb1e55f953adb6d02fd3e02
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>dKUMA Token</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8" target="_blank" rel="noopener noreferrer">
                  0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>KumaBreeder</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0xa206D322829e04fb5acD36F289eD5367AC3E73e4" target="_blank" rel="noopener noreferrer">
                  0xa206D322829e04fb5acD36F289eD5367AC3E73e4
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>dKUMA Breeder Staking</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x00844Af60e061c30BB8cfF5D5D1637559AE1B682" target="_blank" rel="noopener noreferrer">
                  0x00844Af60e061c30BB8cfF5D5D1637559AE1B682
                </AddressValue>
              </AddressRow>
            </AddressTable>

            <SectionHeading>Liquidity Pool Addresses</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>KUMA-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0xdf60e6416fcf8c955fddf01148753a911f7a5905" target="_blank" rel="noopener noreferrer">
                  0xdf60e6416fcf8c955fddf01148753a911f7a5905
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>dKUMA-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0xb4edfec7aa5588786901c63a8338e4b37611b2af" target="_blank" rel="noopener noreferrer">
                  0xb4edfec7aa5588786901c63a8338e4b37611b2af
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>SHIB-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x811beed0119b4afce20d2583eb608c6f7af1954f" target="_blank" rel="noopener noreferrer">
                  0x811beed0119b4afce20d2583eb608c6f7af1954f
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>LEASH-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x874376be8231dad99aabf9ef0767b3cc054c60ee" target="_blank" rel="noopener noreferrer">
                  0x874376be8231dad99aabf9ef0767b3cc054c60ee
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>AKITA-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b" target="_blank" rel="noopener noreferrer">
                  0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>ELON-ETH LP</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x7b73644935b8e68019ac6356c40661e1bc315860" target="_blank" rel="noopener noreferrer">
                  0x7b73644935b8e68019ac6356c40661e1bc315860
                </AddressValue>
              </AddressRow>
            </AddressTable>

            <SectionHeading>Single Staking Token Addresses</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>SHIB</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce" target="_blank" rel="noopener noreferrer">
                  0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>LEASH</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x27c70cd1946795b66be9d954418546998b546634" target="_blank" rel="noopener noreferrer">
                  0x27c70cd1946795b66be9d954418546998b546634
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>AKITA</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x3301ee63fb29f863f2333bd4466acb46cd8323e6" target="_blank" rel="noopener noreferrer">
                  0x3301ee63fb29f863f2333bd4466acb46cd8323e6
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>ELON</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3" target="_blank" rel="noopener noreferrer">
                  0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3
                </AddressValue>
              </AddressRow>
            </AddressTable>
          </ContentSection>
        )

      case 'links':
        return (
          <ContentSection active>
            <PageTitle>Important Links</PageTitle>
            <PageSubtitle>Essential resources and community links</PageSubtitle>

            <SectionHeading>Official Channels</SectionHeading>

            <LinkGrid>
              <LinkCard href="https://x.com/officialkumainu" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#1DA1F2" color="white">
                  <Twitter size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>X (Twitter)</LinkTitle>
                  <LinkSubtitle>@officialkumainu</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://t.me/KumaInuETH" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#0088cc" color="white">
                  <MessageCircle size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Telegram</LinkTitle>
                  <LinkSubtitle>Community Chat</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://discord.gg/kumainueth" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#5865F2" color="white">
                  <MessageCircle size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Discord</LinkTitle>
                  <LinkSubtitle>Community Server</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://github.com/KumaInuETH" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#24292e" color="white">
                  <GitHub size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>GitHub</LinkTitle>
                  <LinkSubtitle>Open Source Code</LinkSubtitle>
                </LinkText>
              </LinkCard>
            </LinkGrid>

            <SectionHeading>Trading & Analytics</SectionHeading>

            <LinkGrid>
              <LinkCard href="https://app.uniswap.org/#/swap?outputCurrency=0x48c276e8d03813224bb1e55f953adb6d02fd3e02" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#FF007A" color="white">
                  <TrendingUp size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Uniswap</LinkTitle>
                  <LinkSubtitle>Trade KUMA</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://www.dextools.io/app/en/ether/pair-explorer/0xdf60e6416fcf8c955fddf01148753a911f7a5905" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#00a8e8" color="white">
                  <TrendingUp size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>DEXTools</LinkTitle>
                  <LinkSubtitle>KUMA Chart</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://etherscan.io/token/0x48c276e8d03813224bb1e55f953adb6d02fd3e02" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#21325b" color="white">
                  <Globe size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Etherscan</LinkTitle>
                  <LinkSubtitle>KUMA Contract</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://www.coingecko.com/en/coins/kuma-inu" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#8BC53F" color="white">
                  <Globe size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>CoinGecko</LinkTitle>
                  <LinkSubtitle>Market Data</LinkSubtitle>
                </LinkText>
              </LinkCard>
            </LinkGrid>

            <SectionHeading>Documentation & Resources</SectionHeading>

            <LinkGrid>
              <LinkCard href="/docs" onClick={(e) => e.preventDefault()}>
                <LinkIcon bg="#ff8502" color="white">
                  <Book size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Documentation</LinkTitle>
                  <LinkSubtitle>This documentation</LinkSubtitle>
                </LinkText>
              </LinkCard>

              <LinkCard href="https://medium.com/@kumainueth" target="_blank" rel="noopener noreferrer">
                <LinkIcon bg="#000000" color="white">
                  <FileText size={20} />
                </LinkIcon>
                <LinkText>
                  <LinkTitle>Medium</LinkTitle>
                  <LinkSubtitle>Articles & Updates</LinkSubtitle>
                </LinkText>
              </LinkCard>
            </LinkGrid>
          </ContentSection>
        )

      case 'faq':
        return (
          <ContentSection active>
            <PageTitle>Frequently Asked Questions</PageTitle>
            <PageSubtitle>Common questions and answers about KumaDex</PageSubtitle>

            <SectionHeading>General</SectionHeading>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('what-is-kuma')}>
                What is Kuma Inu?
                {openFAQs['what-is-kuma'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['what-is-kuma']}>
                Kuma Inu is a community-driven DeFi ecosystem on Ethereum featuring yield farming, decentralized
                governance, and trading infrastructure. The ecosystem includes the KUMA governance token, dKUMA
                reward token, and various protocols like the KumaBreeder and Kuma DAO.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('difference-tokens')}>
                What's the difference between KUMA and dKUMA?
                {openFAQs['difference-tokens'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['difference-tokens']}>
                KUMA is the primary governance token used for voting and staking. dKUMA (Distributed KUMA) is
                the reward token earned through yield farming in the KumaBreeder. Both tokens can be traded on
                decentralized exchanges.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('how-earn')}>
                How do I earn rewards?
                {openFAQs['how-earn'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['how-earn']}>
                You can earn dKUMA rewards by staking tokens in the KumaBreeder. This includes single-sided
                staking of tokens like KUMA, SHIB, and LEASH, or providing liquidity to LP pools like KUMA-ETH
                and staking those LP tokens.
              </FAQAnswer>
            </FAQItem>

            <SectionHeading>Staking & Farming</SectionHeading>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('which-pools')}>
                Which pools should I stake in?
                {openFAQs['which-pools'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['which-pools']}>
                The best pool depends on your goals and risk tolerance. LP pools typically offer higher APRs
                but carry impermanent loss risk. Single-sided staking is simpler but may have lower returns.
                Check the Breeder page for current APRs and make an informed decision.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('claim-rewards')}>
                How often should I claim rewards?
                {openFAQs['claim-rewards'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['claim-rewards']}>
                Rewards accumulate continuously and can be claimed anytime. However, each claim costs gas, so
                it's often more efficient to claim less frequently. Consider gas costs versus your pending
                rewards when deciding.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('impermanent-loss')}>
                What is impermanent loss?
                {openFAQs['impermanent-loss'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['impermanent-loss']}>
                Impermanent loss occurs when providing liquidity to a pool and the price ratio of your deposited
                tokens changes. The loss becomes "permanent" only when you withdraw. LP rewards often offset this
                loss, but it's important to understand the risk.
              </FAQAnswer>
            </FAQItem>

            <SectionHeading>Governance</SectionHeading>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('how-vote')}>
                How do I vote on proposals?
                {openFAQs['how-vote'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['how-vote']}>
                Visit the DAO page when there are active proposals. Connect your wallet containing KUMA tokens
                and cast your vote. Your voting power is proportional to your KUMA holdings at the time of the
                snapshot.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('submit-proposal')}>
                Can I submit a proposal?
                {openFAQs['submit-proposal'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['submit-proposal']}>
                Yes! Any KUMA holder can submit proposals. Start by discussing your idea in the community forums,
                then follow the proposal submission process outlined in the Governance documentation.
              </FAQAnswer>
            </FAQItem>

            <SectionHeading>Security</SectionHeading>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('contracts-audited')}>
                Are the contracts audited?
                {openFAQs['contracts-audited'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['contracts-audited']}>
                Smart contracts follow industry best practices and use battle-tested code from OpenZeppelin.
                All contracts are verified on Etherscan. As with all DeFi, users should understand risks and
                only deposit what they can afford to lose.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion onClick={() => toggleFAQ('verify-contracts')}>
                How do I verify I'm using official contracts?
                {openFAQs['verify-contracts'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </FAQQuestion>
              <FAQAnswer open={openFAQs['verify-contracts']}>
                Always verify contract addresses from the official Addresses page in this documentation.
                Cross-reference with official social channels. Never interact with contracts shared in DMs
                or unofficial sources.
              </FAQAnswer>
            </FAQItem>
          </ContentSection>
        )

      case 'kuma-breeder':
        return (
          <ContentSection active>
            <PageTitle>dKUMA Breeder</PageTitle>
            <PageSubtitle>The engine powering the infinite compounding loop</PageSubtitle>

            <Paragraph>
              The dKUMA Breeder is the beating heart of the Kuma ecosystem - a MasterChef-style yield farming
              contract that distributes <strong>100 dKUMA per Ethereum block</strong> to stakers. But it's more
              than just a farming protocol. The Breeder is designed to create an <strong>infinite compounding
              loop</strong> where your rewards can be reinvested to earn even more rewards, forever.
            </Paragraph>

            <CalloutBox type="warning">
              <CalloutTitle><TrendingUp size={16} /> The Infinite Loop</CalloutTitle>
              <CalloutText>
                Stake → Earn dKUMA → Create dKUMA-ETH LP → Stake LP → Earn more dKUMA → Repeat. This recursive
                loop means your rewards are always working for you, compounding into larger and larger positions.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>How The Loop Works</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>1</span></FeatureIcon>
                <FeatureTitle>Enter The Ecosystem</FeatureTitle>
                <FeatureDescription>
                  Start by staking KUMA, ecosystem tokens (SHIB, LEASH, AKITA, ELON), or their LP pairs.
                  Every block, you earn your share of 100 dKUMA emissions.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>2</span></FeatureIcon>
                <FeatureTitle>Harvest dKUMA</FeatureTitle>
                <FeatureDescription>
                  Claim your accumulated dKUMA rewards. These are real tokens with real value that you
                  can trade, hold, or - most powerfully - reinvest.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>3</span></FeatureIcon>
                <FeatureTitle>Create dKUMA-ETH LP</FeatureTitle>
                <FeatureDescription>
                  Pair your dKUMA with ETH on Uniswap to mint dKUMA-ETH LP tokens. You're now a liquidity
                  provider AND positioned to compound.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><span style={{ fontSize: '20px' }}>∞</span></FeatureIcon>
                <FeatureTitle>Stake & Repeat Forever</FeatureTitle>
                <FeatureDescription>
                  Stake your dKUMA-ETH LP back into the Breeder. Now your rewards are earning rewards.
                  The loop is complete - compound infinitely.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Pool Allocation</SectionHeading>

            <Paragraph>
              The 100 dKUMA per block is distributed across pools based on allocation points set by DAO governance.
              Higher allocation means larger share of rewards:
            </Paragraph>

            <BulletList>
              <li><strong>KUMA Single Staking (2000 alloc):</strong> Largest allocation - stake KUMA, earn dKUMA</li>
              <li><strong>dKUMA-ETH LP (1500 alloc):</strong> The compounding pool - highest APR for loopers</li>
              <li><strong>KUMA-ETH LP (1000 alloc):</strong> Provide KUMA liquidity, earn dKUMA</li>
              <li><strong>Ecosystem LPs (100-5 alloc):</strong> SHIB-ETH, LEASH-ETH, AKITA-ETH, ELON-ETH</li>
              <li><strong>Single Tokens (50-5 alloc):</strong> SHIB, LEASH, AKITA, ELON staking</li>
            </BulletList>

            <SectionHeading>Pool Types</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Layers size={24} /></FeatureIcon>
                <FeatureTitle>LP Token Pools</FeatureTitle>
                <FeatureDescription>
                  Stake Uniswap V2 LP tokens (KUMA-ETH, dKUMA-ETH, SHIB-ETH, etc.) for higher APRs. Subject
                  to impermanent loss but maximizes compounding potential.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Award size={24} /></FeatureIcon>
                <FeatureTitle>Single Token Pools</FeatureTitle>
                <FeatureDescription>
                  Stake individual tokens without providing liquidity. Simpler entry point with no IL risk,
                  but typically lower APRs than LP pools.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Compounding Strategies</SectionHeading>

            <SubsectionHeading>Maximum Compounding</SubsectionHeading>
            <Paragraph>
              For aggressive compounders: Harvest dKUMA frequently → Create dKUMA-ETH LP → Stake LP → Repeat.
              Each cycle increases your share of emissions. Best for larger positions where gas costs are
              proportionally smaller.
            </Paragraph>

            <SubsectionHeading>Balanced Approach</SubsectionHeading>
            <Paragraph>
              Harvest weekly or when gas is low. Accumulate dKUMA until you have enough to make LP creation
              worthwhile. Stake the LP and continue. Good balance of gas efficiency and compounding.
            </Paragraph>

            <SubsectionHeading>Simple Staking</SubsectionHeading>
            <Paragraph>
              Stake KUMA or ecosystem tokens and let rewards accumulate. Harvest when convenient. Lower
              maintenance but doesn't capture the full power of the compounding loop.
            </Paragraph>

            <CalloutBox type="info">
              <CalloutTitle><Zap size={16} /> Gas Optimization</CalloutTitle>
              <CalloutText>
                Compound during low gas periods (weekends, off-peak hours). The larger your position, the more
                frequently compounding makes economic sense. Use gas trackers to time your transactions.
              </CalloutText>
            </CalloutBox>

            <SectionHeading>Emission Math</SectionHeading>

            <CodeBlock>
{`// dKUMA Emissions
sushiPerBlock = 100 dKUMA
blocksPerYear ≈ 2,628,000
totalYearlyEmission ≈ 262,800,000 dKUMA

// Your Share
yourShare = (yourStake / poolTVL) × (poolAlloc / totalAlloc) × sushiPerBlock

// APR Calculation
apr = (yearlyDkumaRewards × dkumaPrice / yourStakeValue) × 100`}
            </CodeBlock>

            <SectionHeading>Current Pools</SectionHeading>

            <Paragraph>
              Visit the <strong>Breeder</strong> page to see all active pools with real-time TVL and APR data.
              Pool allocations can be adjusted through DAO governance proposals - your KUMA voting power
              shapes the ecosystem.
            </Paragraph>
          </ContentSection>
        )

      case 'dkuma-breeder-staking':
        return (
          <ContentSection active>
            <PageTitle>dKUMA Breeder Staking</PageTitle>
            <PageSubtitle>Stake dKUMA tokens to earn USDC rewards</PageSubtitle>

            <Paragraph>
              The dKUMA Breeder Staking contract is a dedicated staking pool where users can stake their dKUMA tokens
              to earn USDC rewards. Unlike the main Kuma Breeder which distributes dKUMA, this contract rewards
              stakers with stablecoin yields, providing a different value proposition for dKUMA holders.
            </Paragraph>

            <SectionHeading>Contract Details</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>Contract Address</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x00844Af60e061c30BB8cfF5D5D1637559AE1B682" target="_blank">
                  0x00844Af60e061c30BB8cfF5D5D1637559AE1B682
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Staking Token</AddressLabel>
                <AddressValue href="https://etherscan.io/token/0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8" target="_blank">
                  dKUMA (0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8)
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Reward Token</AddressLabel>
                <AddressValue href="https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" target="_blank">
                  USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Deposit Fee</AddressLabel>
                <AddressValue as="span">3%</AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Withdrawal Fee</AddressLabel>
                <AddressValue as="span">5%</AddressValue>
              </AddressRow>
            </AddressTable>

            <SectionHeading>How It Works</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><DollarSign /></FeatureIcon>
                <FeatureTitle>1. Stake dKUMA</FeatureTitle>
                <FeatureDescription>
                  Deposit your dKUMA tokens into the staking contract. A 3% fee is taken on deposit
                  and redistributed to existing stakers as additional rewards.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><TrendingUp /></FeatureIcon>
                <FeatureTitle>2. Earn USDC</FeatureTitle>
                <FeatureDescription>
                  Your staked dKUMA earns USDC rewards over time. Rewards accumulate based on your
                  share of the total staking pool.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Award /></FeatureIcon>
                <FeatureTitle>3. Claim Rewards</FeatureTitle>
                <FeatureDescription>
                  Harvest your accumulated USDC rewards at any time. No lock-up period required
                  for claiming your earned rewards.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Zap /></FeatureIcon>
                <FeatureTitle>4. Withdraw</FeatureTitle>
                <FeatureDescription>
                  Unstake your dKUMA when ready. A 5% withdrawal fee applies, which is distributed
                  to remaining stakers as bonus rewards.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Fee Structure</SectionHeading>

            <Paragraph>
              The dKUMA Breeder Staking uses a fee model that rewards long-term stakers:
            </Paragraph>

            <ul>
              <li><strong>3% Deposit Fee:</strong> Taken when you stake dKUMA. This fee is redistributed to all current stakers, rewarding those already in the pool.</li>
              <li><strong>5% Withdrawal Fee:</strong> Taken when you unstake dKUMA. This discourages short-term farming and rewards committed stakers.</li>
            </ul>

            <Paragraph>
              These fees create a sustainable reward mechanism where the pool continuously generates yields for
              long-term participants, even during periods of low external reward injection.
            </Paragraph>

            <SectionHeading>Pool Statistics</SectionHeading>

            <Paragraph>
              The dKUMA Breeder Staking page displays real-time statistics including:
            </Paragraph>

            <ul>
              <li><strong>Total Staked:</strong> The total amount of dKUMA currently staked in the contract</li>
              <li><strong>TVL (Total Value Locked):</strong> The USD value of all staked dKUMA</li>
              <li><strong>Your Staked Amount:</strong> How much dKUMA you have deposited</li>
              <li><strong>Your Pending Rewards:</strong> USDC rewards available to claim</li>
              <li><strong>Your Pool Share:</strong> Your percentage of the total staking pool</li>
              <li><strong>Countdown Timer:</strong> Time until the current reward period ends</li>
            </ul>

            <SectionHeading>Getting Started</SectionHeading>

            <Paragraph>
              To start staking in the dKUMA Breeder:
            </Paragraph>

            <ol>
              <li>Acquire dKUMA tokens (earned from the main Kuma Breeder or purchased on Uniswap)</li>
              <li>Navigate to the dKUMA Breeder Staking page</li>
              <li>Connect your wallet</li>
              <li>Approve dKUMA spending (first time only)</li>
              <li>Enter the amount to stake and click "STAKE"</li>
              <li>Watch your USDC rewards accumulate</li>
              <li>Claim rewards whenever you want</li>
            </ol>

            <Paragraph>
              Visit the <strong>dKUMA Breeder</strong> page to start earning USDC rewards on your dKUMA holdings.
            </Paragraph>
          </ContentSection>
        )

      case 'kuma-dao':
        return (
          <ContentSection active>
            <PageTitle>Kuma DAO</PageTitle>
            <PageSubtitle>Decentralized governance for the Kuma ecosystem</PageSubtitle>

            <Paragraph>
              The Kuma DAO enables token holders to participate in protocol governance. KUMA holders can
              create proposals, vote on changes, and shape the future direction of the ecosystem.
            </Paragraph>

            <SectionHeading>Governance Powers</SectionHeading>

            <BulletList>
              <li>Adjust Breeder pool allocations and emission rates</li>
              <li>Approve treasury spending and grants</li>
              <li>Add or remove supported tokens and pools</li>
              <li>Upgrade protocol contracts</li>
              <li>Establish partnerships and integrations</li>
            </BulletList>

            <SectionHeading>Getting Started</SectionHeading>

            <Paragraph>
              To participate in governance:
            </Paragraph>

            <BulletList>
              <li>Hold KUMA tokens in your wallet</li>
              <li>Visit the DAO page to view active proposals</li>
              <li>Connect your wallet and cast your vote</li>
              <li>Engage in community discussions to shape future proposals</li>
            </BulletList>

            <CalloutBox type="info">
              <CalloutTitle><Users size={16} /> Your Voice Matters</CalloutTitle>
              <CalloutText>
                Every KUMA token represents one vote. Active participation in governance helps ensure the
                protocol evolves in a direction that benefits all stakeholders.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'dkuma-dao':
        return (
          <ContentSection active>
            <PageTitle>dKuma DAO</PageTitle>
            <PageSubtitle>USDC yield generation and stable returns</PageSubtitle>

            <Paragraph>
              The dKuma DAO is a separate governance structure focused on stable yield generation through USDC.
              It enables users to deposit USDC and earn consistent returns through various DeFi strategies.
            </Paragraph>

            <SectionHeading>Key Features</SectionHeading>

            <BulletList>
              <li><strong>USDC Deposits:</strong> Deposit USDC to start earning stable yields immediately</li>
              <li><strong>Auto-Compounding:</strong> Rewards are automatically reinvested to maximize returns</li>
              <li><strong>No Lock-ups:</strong> Withdraw your USDC at any time with no penalties</li>
              <li><strong>Transparent Yields:</strong> All yield sources and APY calculations are fully transparent</li>
            </BulletList>

            <SectionHeading>Yield Strategies</SectionHeading>

            <Paragraph>
              The dKuma DAO deploys USDC across multiple yield-generating strategies:
            </Paragraph>

            <BulletList>
              <li><strong>Stable Yield Pool:</strong> Low-risk lending strategies with consistent returns (~12% APY)</li>
              <li><strong>USDC-ETH LP:</strong> Liquidity provision rewards with higher yields (~25% APY)</li>
              <li><strong>Auto-Compound Vault:</strong> Optimized strategies with automatic reinvestment (~18% APY)</li>
            </BulletList>

            <SectionHeading>How to Participate</SectionHeading>

            <BulletList>
              <li>Navigate to the dKuma Breeder page</li>
              <li>Connect your wallet containing USDC</li>
              <li>Choose your preferred yield strategy</li>
              <li>Deposit USDC and start earning immediately</li>
              <li>Withdraw anytime with no lock-up periods</li>
            </BulletList>

            <CalloutBox type="success">
              <CalloutTitle><DollarSign size={16} /> Stable Returns</CalloutTitle>
              <CalloutText>
                dKuma DAO focuses on sustainable, stable yields rather than high-risk strategies.
                Your USDC deposits are managed with capital preservation as a priority.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'dkuma-token':
        return (
          <ContentSection active>
            <PageTitle>dKUMA Token</PageTitle>
            <PageSubtitle>The reward token of the Kuma ecosystem</PageSubtitle>

            <Paragraph>
              dKUMA (Distributed KUMA) is the reward token emitted by the KumaBreeder contract. It serves as
              the primary incentive mechanism for liquidity providers and stakers in the ecosystem.
            </Paragraph>

            <SectionHeading>Token Details</SectionHeading>

            <AddressTable>
              <AddressRow>
                <AddressLabel>Contract Address</AddressLabel>
                <AddressValue href="https://etherscan.io/address/0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8" target="_blank" rel="noopener noreferrer">
                  0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8
                </AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Emission Rate</AddressLabel>
                <AddressValue as="span">100 dKUMA per block</AddressValue>
              </AddressRow>
              <AddressRow>
                <AddressLabel>Network</AddressLabel>
                <AddressValue as="span">Ethereum Mainnet</AddressValue>
              </AddressRow>
            </AddressTable>

            <SectionHeading>Use Cases</SectionHeading>

            <BulletList>
              <li><strong>Trading:</strong> dKUMA can be traded on Uniswap against ETH</li>
              <li><strong>LP Farming:</strong> Provide dKUMA-ETH liquidity to earn additional rewards</li>
              <li><strong>Ecosystem Rewards:</strong> Used for various community incentives and bounties</li>
            </BulletList>

            <SectionHeading>Trading</SectionHeading>

            <Paragraph>
              dKUMA can be traded on Uniswap V2 through the dKUMA-ETH liquidity pool. The price is determined
              by open market trading.
            </Paragraph>
          </ContentSection>
        )

      case 'vessel-vault':
        return (
          <ContentSection active>
            <PageTitle>Vessel Vault</PageTitle>
            <PageSubtitle>Advanced staking strategies and vaults</PageSubtitle>

            <Paragraph>
              Vessel Vault provides enhanced staking mechanisms for users seeking optimized yield strategies.
              Lock tokens for extended periods to maximize rewards and gain additional benefits.
            </Paragraph>

            <SectionHeading>Features</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Shield size={24} /></FeatureIcon>
                <FeatureTitle>Time-Locked Staking</FeatureTitle>
                <FeatureDescription>
                  Lock tokens for defined periods to earn boosted rewards. Longer locks receive higher multipliers.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
                <FeatureTitle>Yield Optimization</FeatureTitle>
                <FeatureDescription>
                  Automated strategies to maximize returns from staking positions.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <CalloutBox type="info">
              <CalloutTitle><Zap size={16} /> Coming Soon</CalloutTitle>
              <CalloutText>
                Vessel Vault V2 is under development with enhanced features including auto-compounding and
                cross-pool strategies.
              </CalloutText>
            </CalloutBox>
          </ContentSection>
        )

      case 'kumadex':
        return (
          <ContentSection active>
            <PageTitle>KumaDex</PageTitle>
            <PageSubtitle>The unified interface for the Kuma ecosystem</PageSubtitle>

            <Paragraph>
              KumaDex is the primary web interface for interacting with all Kuma ecosystem protocols. It
              provides a seamless experience for trading, staking, governance, and portfolio management.
            </Paragraph>

            <SectionHeading>Features</SectionHeading>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
                <FeatureTitle>Token Swap</FeatureTitle>
                <FeatureDescription>
                  Trade tokens through integrated DEX aggregation for optimal pricing across liquidity sources.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Layers size={24} /></FeatureIcon>
                <FeatureTitle>Breeder Interface</FeatureTitle>
                <FeatureDescription>
                  Stake, unstake, and manage your yield farming positions across all active pools.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Users size={24} /></FeatureIcon>
                <FeatureTitle>DAO Dashboard</FeatureTitle>
                <FeatureDescription>
                  View and vote on governance proposals, track voting history, and participate in discussions.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Award size={24} /></FeatureIcon>
                <FeatureTitle>Portfolio Tracker</FeatureTitle>
                <FeatureDescription>
                  Monitor your positions, pending rewards, and overall portfolio performance.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <SectionHeading>Getting Started</SectionHeading>

            <BulletList>
              <li>Connect your Ethereum wallet (MetaMask, WalletConnect, etc.)</li>
              <li>Ensure you're on Ethereum Mainnet</li>
              <li>Navigate to your desired feature using the top navigation</li>
              <li>Approve token spending when prompted for first-time interactions</li>
            </BulletList>
          </ContentSection>
        )

      default:
        return null
    }
  }

  return (
    <DocsContainer>
      <MobileToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Book size={20} />
      </MobileToggle>

      <Sidebar open={sidebarOpen}>
        {sections.map((section) => (
          <SidebarSection key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.items.map((item) => {
              const IconComponent = item.icon
              return (
                <NavItem
                  key={item.id}
                  active={activeSection === item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  {IconComponent && <IconComponent />}
                  {!IconComponent && <div style={{ width: 16, marginRight: 8 }} />}
                  {item.label}
                </NavItem>
              )
            })}
          </SidebarSection>
        ))}
      </Sidebar>

      <Content>
        {renderContent()}
      </Content>
    </DocsContainer>
  )
}

export default DocsInterface
