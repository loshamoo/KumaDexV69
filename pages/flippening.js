import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

/** Legacy route — Gravity lives at /gravity */
export default function FlippeningRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/gravity')
  }, [router])
  return (
    <>
      <Head>
        <title>Redirecting to Gravity | KumaDex</title>
        <meta httpEquiv="refresh" content="0;url=/gravity" />
      </Head>
      <p style={{ color: '#9B9B9B', padding: 40, textAlign: 'center' }}>
        Gravity moved to <a href="/gravity" style={{ color: '#ff8502' }}>/gravity</a>…
      </p>
    </>
  )
}
