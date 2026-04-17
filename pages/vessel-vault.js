import Head from 'next/head'
import Header from '../src/components/Header'
import VesselVaultInterface from '../src/components/VesselVaultInterface'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`

export default function VesselVault() {
  return (
    <>
      <Head>
        <title>Vessel Vault - KumaDEX</title>
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <VesselVaultInterface />
        </MainContent>
      </AppContainer>
    </>
  )
}