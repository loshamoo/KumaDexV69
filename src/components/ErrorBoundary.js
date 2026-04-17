import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#141823',
          color: '#ffffff',
          padding: '2rem',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '3rem', 
              margin: '0', 
              color: '#ff3333',
              marginBottom: '1rem'
            }}>
              Something went wrong
            </h1>
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#888',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              An unexpected error has occurred. The application has encountered an issue and cannot continue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                backgroundColor: '#1a1f2e',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                textAlign: 'left',
                border: '1px solid #333'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  color: '#ff6666',
                  marginBottom: '0.5rem'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  color: '#ff9999',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  marginTop: '1rem'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#ff3333',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                marginTop: '1rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5555'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ff3333'}
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary