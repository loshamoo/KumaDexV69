import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWeb3 } from '../context/Web3Context';
import { DKUMA_ABI, DKUMA_ADDRESS, NETWORK_CONFIG } from '../contracts/dKumaABI';
import Web3 from 'web3';
import TransactionNotification from './TransactionNotification';

const DAOContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  width: 100%;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    max-width: 500px;
  }
`;

const DAOCard = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, ${props => props.highlight ? 'rgba(0, 212, 170, 0.15)' : 'rgba(252, 114, 255, 0.15)'} 0%, transparent 60%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 80%;
    height: 80%;
    background: radial-gradient(circle, ${props => props.highlight ? 'rgba(252, 114, 255, 0.1)' : 'rgba(0, 212, 170, 0.1)'} 0%, transparent 60%);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  }
`;

const CardTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: ${props => props.highlight ? '#00d4aa' : '#fc72ff'};
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 20px ${props => props.highlight ? 'rgba(0, 212, 170, 0.5)' : 'rgba(252, 114, 255, 0.5)'};
`;

const DelegateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 300px;
`;

const DelegateInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
`;

const InfoLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
`;

const DescriptionText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 20px 0;
  font-size: 16px;

  .highlight {
    color: #fc72ff;
    font-weight: bold;
  }

  .highlight2 {
    color: #00d4aa;
    font-weight: bold;
  }
`;

const ActionButton = styled.button`
  background: #4d2a52;
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(77, 42, 82, 0.4);
    background: #3f2153;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &:disabled {
    border-color: rgba(255, 255, 255, 0.1);
    background: transparent;
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ProposalDropdown = styled.select`
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  padding: 12px 16px;
  width: 100%;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #fc72ff;
  }

  option {
    background: #1a1f2e;
    color: white;
  }
`;

const VotingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const VoteButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const VoteButton = styled(ActionButton)`
  font-size: 16px;
  padding: 12px 20px;
  
  &.for {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    
    &:hover {
      background: linear-gradient(135deg, #16a34a, #15803d);
    }
  }
  
  &.against {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    
    &:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
    }
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  accent-color: #fc72ff;
`;

const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
`;

const DAOInterface = () => {
  const { web3, account, isConnected, chainId } = useWeb3();
  const [contract, setContract] = useState(null);
  const [readOnlyWeb3, setReadOnlyWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Delegate state
  const [currentDelegate, setCurrentDelegate] = useState('');
  const [votingPower, setVotingPower] = useState('0');
  const [dkumaBalance, setDkumaBalance] = useState('0');
  
  // Proposal state
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState('');
  const [signedPaw, setSignedPaw] = useState(false);
  
  // Initialize read-only Web3 instance
  useEffect(() => {
    const initReadOnlyWeb3 = async () => {
      try {
        const web3Instance = new Web3(new Web3.providers.HttpProvider(NETWORK_CONFIG.ETHEREUM_MAINNET.rpcUrl));
        setReadOnlyWeb3(web3Instance);
        
        const dkumaContract = new web3Instance.eth.Contract(DKUMA_ABI, DKUMA_ADDRESS);
        setContract(dkumaContract);
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing read-only Web3:', error);
        setLoading(false);
      }
    };
    
    initReadOnlyWeb3();
  }, []);

  // Update contract when wallet connects
  useEffect(() => {
    if (web3 && DKUMA_ADDRESS) {
      const walletContract = new web3.eth.Contract(DKUMA_ABI, DKUMA_ADDRESS);
      setContract(walletContract);
    }
  }, [web3]);

  // Fetch user's delegation info and balance
  const fetchDelegateInfo = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      const [delegate, votes, balance] = await Promise.all([
        contract.methods.delegates(account).call(),
        contract.methods.getCurrentVotes(account).call(),
        contract.methods.balanceOf(account).call()
      ]);
      
      setCurrentDelegate(delegate);
      setVotingPower(readOnlyWeb3.utils.fromWei(votes, 'ether'));
      setDkumaBalance(readOnlyWeb3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error fetching delegate info:', error);
    }
  }, [contract, account, readOnlyWeb3]);

  // Fetch proposals (mock data for now)
  const fetchProposals = useCallback(async () => {
    // Mock proposals since the contract might not have proposal functionality yet
    const mockProposals = [
      { id: '1', title: 'Proposal #1: Increase Staking Rewards', status: 'Active' },
      { id: '2', title: 'Proposal #2: Treasury Management', status: 'Coming Soon' },
      { id: '3', title: 'Proposal #3: Community Fund', status: 'Coming Soon' }
    ];
    setProposals(mockProposals);
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      fetchDelegateInfo();
    }
    fetchProposals();
  }, [isConnected, account, fetchDelegateInfo, fetchProposals]);

  const handleDelegate = async () => {
    if (!contract || !account || !web3) return;
    
    if (chainId !== NETWORK_CONFIG.ETHEREUM_MAINNET.chainId) {
      setNotification({
        type: 'error',
        message: 'Please switch to Ethereum Mainnet'
      });
      return;
    }
    
    try {
      setNotification({ type: 'pending', message: 'Becoming a delegate...' });
      
      const tx = await contract.methods.delegate(account).send({ from: account });
      
      setNotification({
        type: 'success',
        message: 'Successfully became a delegate!',
        txHash: tx.transactionHash
      });
      
      setTimeout(() => fetchDelegateInfo(), 2000);
    } catch (error) {
      console.error('Delegate error:', error);
      setNotification({
        type: 'error',
        message: `Delegation failed: ${error.message}`
      });
    }
  };

  const handleVote = async (support) => {
    if (!contract || !account || !web3 || !selectedProposal || !signedPaw) return;
    
    try {
      setNotification({ type: 'pending', message: `Casting ${support ? 'FOR' : 'AGAINST'} vote...` });
      
      // This would be the actual vote transaction
      // const tx = await contract.methods.castVote(selectedProposal, support).send({ from: account });
      
      // Mock success for now
      setTimeout(() => {
        setNotification({
          type: 'success',
          message: `Vote cast successfully! You voted ${support ? 'FOR' : 'AGAINST'} the proposal.`
        });
      }, 2000);
      
    } catch (error) {
      console.error('Vote error:', error);
      setNotification({
        type: 'error',
        message: `Vote failed: ${error.message}`
      });
    }
  };

  // Auto-hide notifications
  useEffect(() => {
    if (notification && notification.type !== 'pending') {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <DAOContainer>
        <div style={{ color: '#fc72ff', textAlign: 'center', fontSize: '18px' }}>
          Loading DAO interface...
        </div>
      </DAOContainer>
    );
  }

  return (
    <>
      <DAOContainer>
        {/* Become a Delegate Section */}
        <DAOCard id="dao-delegate-card">
          <CardTitle>BECOME A DELEGATE</CardTitle>
          
          <DelegateSection>
            <DelegateInfo>
              <InfoLabel>Your delegate:</InfoLabel>
              <InfoValue>
                {currentDelegate || 'Not delegated'}
              </InfoValue>
            </DelegateInfo>
            
            <DelegateInfo id="dao-voting-power">
              <InfoLabel>Voting Power:</InfoLabel>
              <InfoValue>
                {parseFloat(votingPower).toFixed(4)} dKUMA
              </InfoValue>
            </DelegateInfo>
            
            <DelegateInfo>
              <InfoLabel>dKUMA Balance:</InfoLabel>
              <InfoValue>
                {parseFloat(dkumaBalance).toFixed(4)} dKUMA
              </InfoValue>
            </DelegateInfo>
            
            <DescriptionText>
              By becoming a delegate you are enabling your account to vote on{' '}
              <span className="highlight">Kuma DEX DAO</span> proposals.
            </DescriptionText>
            
            <DescriptionText>
              Unleash <span className="highlight">dKUMA</span>'s true power, become a fearless guardian of decentralization.
            </DescriptionText>
            
            <ActionButton
              id="dao-delegate-button"
              onClick={handleDelegate}
              disabled={!isConnected || currentDelegate === account}
            >
              {currentDelegate === account ? 'Already a Delegate' : 'Become a delegate'}
            </ActionButton>
          </DelegateSection>
        </DAOCard>

        {/* Select a Proposal Section */}
        <DAOCard highlight id="dao-proposal-card">
          <CardTitle highlight>SELECT A PROPOSAL</CardTitle>
          
          <ProposalDropdown
            id="dao-proposal-dropdown"
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
          >
            <option value="">Coming Soon</option>
            {proposals.map((proposal) => (
              <option key={proposal.id} value={proposal.id} disabled={proposal.status !== 'Active'}>
                {proposal.title} ({proposal.status})
              </option>
            ))}
          </ProposalDropdown>
          
          <CheckboxContainer id="dao-sign-paw">
            <Checkbox
              id="signPaw"
              checked={signedPaw}
              onChange={(e) => setSignedPaw(e.target.checked)}
            />
            <CheckboxLabel htmlFor="signPaw">
              Sign Your Paw
            </CheckboxLabel>
          </CheckboxContainer>
          
          <VotingSection id="dao-voting-section">
            <VoteButtons id="dao-vote-buttons">
              <VoteButton
                className="for"
                onClick={() => handleVote(true)}
                disabled={!isConnected || !selectedProposal || !signedPaw || currentDelegate !== account}
              >
                Vote FOR
              </VoteButton>
              <VoteButton
                className="against"
                onClick={() => handleVote(false)}
                disabled={!isConnected || !selectedProposal || !signedPaw || currentDelegate !== account}
              >
                Vote AGAINST
              </VoteButton>
            </VoteButtons>
            
            {currentDelegate !== account && isConnected && (
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textAlign: 'center' }}>
                You must be a delegate to vote
              </div>
            )}
          </VotingSection>
        </DAOCard>
      </DAOContainer>
      
      <TransactionNotification notification={notification} />
    </>
  );
};

export default DAOInterface;