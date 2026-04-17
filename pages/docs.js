import Header from '../src/components/Header'
import DocsInterface from '../src/components/DocsInterface'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  min-height: calc(100vh - 80px);
`

export default function Docs() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <DocsInterface />
      </MainContent>
    </AppContainer>
  )
}