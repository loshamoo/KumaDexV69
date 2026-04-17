function Error({ statusCode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#141823',
      color: '#ffffff',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0', color: '#ff3333' }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#888' }}>
        {statusCode
          ? `A ${statusCode} error occurred on the server`
          : 'An error occurred on the client'}
      </p>
      <a href="/" style={{
        marginTop: '2rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#ff3333',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '4px',
        transition: 'background-color 0.3s'
      }}>
        Return Home
      </a>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error