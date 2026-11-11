import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

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
        Gravity moved to <Link href="/gravity" style={{ color: '#ff8502' }}>/gravity</Link>…
      </p>
    </>
  )
}
