import React from 'react'
import { PostHogInit } from './PostHogInit'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogInit />
        {children}
      </body>
    </html>
  )
}
