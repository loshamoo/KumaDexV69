import Header from '../src/components/Header'
import LiquidityPool from '../src/components/LiquidityPool'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 20px;
  
  @media (max-width: 768px) {
    padding: 40px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`

export default function Pool() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <LiquidityPool />
      </MainContent>
    </AppContainer>
  )
}