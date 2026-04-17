import Header from '../src/components/Header'
import AddressesInterface from '../src/components/AddressesInterface'
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

export default function Addresses() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <AddressesInterface />
      </MainContent>
    </AppContainer>
  )
}