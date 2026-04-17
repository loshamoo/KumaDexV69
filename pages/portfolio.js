import Header from '../src/components/Header'
import Portfolio from '../src/components/Portfolio'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`

export default function PortfolioPage() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Portfolio />
      </MainContent>
    </AppContainer>
  )
}