'use client'

import { Web3Provider } from '@/lib/web3-context'
import { ReactNode } from 'react'

export function LayoutProvider({ children }: { children: ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  )
}
