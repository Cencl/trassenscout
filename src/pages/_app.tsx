import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
// https://fontsource.org/fonts/overpass/install => Tab "Static"
import "@fontsource/overpass/400-italic.css"
import "@fontsource/overpass/400.css"
import "@fontsource/overpass/500.css"
// import "@fontsource/overpass/500-italic.css"
import { init } from "@socialgouv/matomo-next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { useEffect, useRef } from "react"
import LoginPage from "./auth/login"
import { withBlitz } from "src/blitz-client"
import "src/core/styles/index.css"

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginPage messageKey="loginRequired" />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const matomoInitialized = useRef(false)

  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID && matomoInitialized.current === false) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
    return () => {
      matomoInitialized.current = true
    }
  }, [])

  const getLayout = Component.getLayout || ((page) => page)

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      {getLayout(<Component {...pageProps} />)}
    </ErrorBoundary>
  )
}

export default withBlitz(MyApp)
