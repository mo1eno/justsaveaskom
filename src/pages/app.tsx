import { useEffect } from 'react';
import posthog from 'posthog-js';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!posthog.__loaded) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '', {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          autocapture: true,
          capture_pageview: true,
          disable_session_recording: false,
        });
      }

      // Добавим задержку, чтобы init точно сработал
      setTimeout(() => {
        posthog.capture('app_loaded');
      }, 100);
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
