'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { BrowserProvider, ethers } from 'ethers'

interface Web3ContextType {
  provider: BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  isConnected: boolean
  chainId: number | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false
    return (window as any).ethereum !== undefined
  }

  // Initialize provider on mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      console.warn('MetaMask is not installed')
      return
    }

    const initializeProvider = async () => {
      try {
        const ethereumProvider = (window as any).ethereum
        if (ethereumProvider) {
          const ethersProvider = new BrowserProvider(ethereumProvider)
          setProvider(ethersProvider)

          // Listen for account changes
          ethereumProvider.on('accountsChanged', handleAccountsChanged)
          // Listen for chain changes
          ethereumProvider.on('chainChanged', handleChainChanged)

          // Check if already connected
          const accounts = await ethereumProvider.request({
            method: 'eth_accounts',
          })
          if (accounts && accounts.length > 0) {
            await connectToExistingAccount(ethersProvider)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize Web3 provider'
        setError(message)
        console.error('Web3 initialization error:', err)
      }
    }

    initializeProvider()

    return () => {
      const ethereumProvider = (window as any).ethereum
      if (ethereumProvider) {
        ethereumProvider.removeListener('accountsChanged', handleAccountsChanged)
        ethereumProvider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const connectToExistingAccount = async (ethersProvider: BrowserProvider) => {
    try {
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()
      const network = await ethersProvider.getNetwork()

      setSigner(signer)
      setAccount(address)
      setChainId(Number(network.chainId))
      setIsConnected(true)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to account'
      setError(message)
      console.error('Account connection error:', err)
    }
  }

  const connect = async () => {
    if (!provider) {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const ethereumProvider = (window as any).ethereum

      // Request account access
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        await connectToExistingAccount(provider)
        setIsConnecting(false)
      }
    } catch (err: any) {
      setIsConnecting(false)
      if (err.code === 4001) {
        setError('User rejected the connection request')
      } else {
        const message = err instanceof Error ? err.message : 'Failed to connect wallet'
        setError(message)
      }
      console.error('Connection error:', err)
    }
  }

  const disconnect = async () => {
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
    setError(null)
  }

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    isConnected,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}
