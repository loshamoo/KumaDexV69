import { useState, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { X, ArrowRight, ArrowLeft, Check } from 'react-feather'
import Image from 'next/image'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(63, 33, 83, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(63, 33, 83, 0);
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 9998;
  animation: ${fadeIn} 0.3s ease;
`

const SpotlightHole = styled.div`
  position: fixed;
  z-index: 9999;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid #3f2153;
    border-radius: 14px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`

const TooltipContainer = styled.div`
  position: fixed;
  z-index: 10000;
  width: 340px;
  max-width: calc(100vw - 32px);
  animation: ${slideUp} 0.3s ease;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1);
`

const TooltipHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`

const StepBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #3f2153;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }
`

const TooltipTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`

const TooltipDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0 0 20px 0;
`

const TooltipFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ProgressDots = styled.div`
  display: flex;
  gap: 6px;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) =>
    $completed ? '#3f2153' :
    $active ? '#3f2153' :
    'rgba(255, 255, 255, 0.2)'};
  transition: all 0.2s ease;
  transform: ${({ $active }) => $active ? 'scale(1.2)' : 'scale(1)'};
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $primary, theme }) => $primary ? `
    background: #3f2153;
    color: #fff;
    border: none;

    &:hover {
      background: #2d1840;
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.primary};

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: ${theme.colors.text.primary};
    }
  `}
`

const WelcomeOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`

const WelcomeCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 20px;
  padding: 32px;
  max-width: 440px;
  width: calc(100% - 32px);
  text-align: center;
  animation: ${slideUp} 0.4s ease;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
`

const WelcomeIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #3f2153;
  box-shadow: 0 0 20px rgba(63, 33, 83, 0.4);
  background: ${({ theme }) => theme.colors.background.secondary};
`

const WelcomeIconEmoji = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #3f2153, #5a3470);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`

const WelcomeTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 12px 0;
`

const WelcomeDescription = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0 0 24px 0;
`

const WelcomeButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

const CoachMarks = ({
  id,
  steps,
  welcomeTitle,
  welcomeDescription,
  welcomeIcon = '👋',
  welcomeLogo = null,
  onComplete,
  showWelcome = true
}) => {
  const [isActive, setIsActive] = useState(false)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlightPosition, setSpotlightPosition] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const storageKey = `coachmarks_${id}_completed`

  useEffect(() => {
    const completed = localStorage.getItem(storageKey)
    if (!completed) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        if (showWelcome) {
          setShowWelcomeScreen(true)
        } else {
          setIsActive(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [storageKey, showWelcome])

  const calculatePositions = useCallback(() => {
    if (!isActive || !steps[currentStep]) return

    const step = steps[currentStep]
    const element = document.querySelector(step.target)

    if (element) {
      const rect = element.getBoundingClientRect()
      const padding = 8

      setSpotlightPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      })

      // Calculate tooltip position based on placement
      const tooltipWidth = 340
      const tooltipHeight = 200 // approximate
      const gap = 16

      let top, left

      switch (step.placement || 'bottom') {
        case 'top':
          top = rect.top - tooltipHeight - gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - gap
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + gap
          break
        default:
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))

      setTooltipPosition({ top, left })
    }
  }, [currentStep, isActive, steps])

  useEffect(() => {
    calculatePositions()

    const handleResize = () => calculatePositions()
    const handleScroll = () => calculatePositions()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [calculatePositions])

  const handleStart = () => {
    setShowWelcomeScreen(false)
    setIsActive(true)
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true')
    setShowWelcomeScreen(false)
    setIsActive(false)
    onComplete?.()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true')
    setIsActive(false)
    onComplete?.()
  }

  if (showWelcomeScreen) {
    return (
      <WelcomeOverlay>
        <WelcomeCard>
          {welcomeLogo ? (
            <WelcomeIconWrapper>
              <Image
                src={welcomeLogo}
                alt="Logo"
                width={72}
                height={72}
                style={{ borderRadius: '50%' }}
              />
            </WelcomeIconWrapper>
          ) : (
            <WelcomeIconEmoji>{welcomeIcon}</WelcomeIconEmoji>
          )}
          <WelcomeTitle>{welcomeTitle}</WelcomeTitle>
          <WelcomeDescription>{welcomeDescription}</WelcomeDescription>
          <WelcomeButtons>
            <Button onClick={handleSkip}>Skip Tour</Button>
            <Button $primary onClick={handleStart}>
              Start Tour
              <ArrowRight size={16} />
            </Button>
          </WelcomeButtons>
        </WelcomeCard>
      </WelcomeOverlay>
    )
  }

  if (!isActive || !steps[currentStep]) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      <Overlay onClick={handleSkip} />

      {spotlightPosition && (
        <SpotlightHole
          style={{
            top: spotlightPosition.top,
            left: spotlightPosition.left,
            width: spotlightPosition.width,
            height: spotlightPosition.height
          }}
        />
      )}

      <TooltipContainer
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <TooltipCard>
          <TooltipHeader>
            <StepBadge>
              Step {currentStep + 1} of {steps.length}
            </StepBadge>
            <CloseButton onClick={handleSkip} aria-label="Close tour">
              <X size={18} />
            </CloseButton>
          </TooltipHeader>

          <TooltipTitle>{step.title}</TooltipTitle>
          <TooltipDescription>{step.description}</TooltipDescription>

          <TooltipFooter>
            <ProgressDots>
              {steps.map((_, index) => (
                <Dot
                  key={index}
                  $active={index === currentStep}
                  $completed={index < currentStep}
                />
              ))}
            </ProgressDots>

            <ButtonGroup>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
              <Button $primary onClick={handleNext}>
                {isLastStep ? (
                  <>
                    Done
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </ButtonGroup>
          </TooltipFooter>
        </TooltipCard>
      </TooltipContainer>
    </>
  )
}

export default CoachMarks
