import '../src/index.css'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '../src/styles/GlobalStyle'
import { theme } from '../src/styles/theme'
import { Web3Provider } from '../src/context/Web3Context'
import ErrorBoundary from '../src/components/ErrorBoundary'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <Web3Provider>
          <GlobalStyle />
          <Component {...pageProps} />
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default MyApp