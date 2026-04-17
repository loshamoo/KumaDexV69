import { useState } from 'react';
import styled from 'styled-components';
import { X } from 'react-feather';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background.charcoal};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  width: 420px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const SettingSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 12px;
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 16px;
  line-height: 1.4;
`;

const SlippageOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const SlippageButton = styled.button`
  padding: 12px 8px;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.background.secondary};
  color: ${({ theme, $active }) => 
    $active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CustomSlippageInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DeadlineInput = styled.input`
  width: 120px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InputSuffix = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const presetSlippages = ['0.1', '0.5', '1.0'];

const SwapSettings = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [localSlippage, setLocalSlippage] = useState(settings.slippage);
  const [localDeadline, setLocalDeadline] = useState(settings.deadline);
  const [isCustomSlippage, setIsCustomSlippage] = useState(
    !presetSlippages.includes(settings.slippage)
  );

  const handleSlippageSelect = (value) => {
    setLocalSlippage(value);
    setIsCustomSlippage(false);
  };

  const handleCustomSlippageChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 50)) {
      setLocalSlippage(value);
      setIsCustomSlippage(true);
    }
  };

  const handleDeadlineChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 4320)) {
      setLocalDeadline(value);
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      slippage: localSlippage,
      deadline: localDeadline
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Transaction Settings</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <SettingSection>
          <SettingLabel>Slippage tolerance</SettingLabel>
          <SettingDescription>
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </SettingDescription>
          <SlippageOptions>
            {presetSlippages.map((value) => (
              <SlippageButton
                key={value}
                $active={localSlippage === value && !isCustomSlippage}
                onClick={() => handleSlippageSelect(value)}
              >
                {value}%
              </SlippageButton>
            ))}
            <SlippageButton
              $active={isCustomSlippage}
              onClick={() => setIsCustomSlippage(true)}
            >
              Custom
            </SlippageButton>
          </SlippageOptions>
          {isCustomSlippage && (
            <CustomSlippageInput
              type="text"
              placeholder="0.50"
              value={localSlippage}
              onChange={handleCustomSlippageChange}
              autoFocus
            />
          )}
        </SettingSection>

        <SettingSection>
          <SettingLabel>Transaction deadline</SettingLabel>
          <SettingDescription>
            Your transaction will revert if it is pending for more than this long.
          </SettingDescription>
          <InputWrapper>
            <DeadlineInput
              type="text"
              value={localDeadline}
              onChange={handleDeadlineChange}
            />
            <InputSuffix>minutes</InputSuffix>
          </InputWrapper>
        </SettingSection>

        <SlippageButton
          style={{ width: '100%', marginTop: '16px' }}
          $active={true}
          onClick={handleSave}
        >
          Save Settings
        </SlippageButton>
      </Modal>
    </Overlay>
  );
};

export default SwapSettings;