# Web3 & MetaMask Integration Guide

This document explains the Web3 and MetaMask integration that has been added to the Team Management System.

## Overview

The application now supports MetaMask wallet connection for authentication. Users can sign in using their Ethereum wallet instead of traditional email/password.

## Components and Files

### Core Files

1. **`lib/web3-context.tsx`** - Web3 Context Provider
   - Manages wallet connection state
   - Handles MetaMask provider initialization
   - Listens for account and chain changes
   - Provides `useWeb3()` hook for components

2. **`lib/web3-utils.ts`** - Web3 Utilities
   - `signMessage()` - Sign messages with wallet
   - `verifyMessage()` - Verify signed messages
   - `generateNonce()` - Generate authentication nonces
   - `createSignInMessage()` - Create sign-in messages
   - `toChecksumAddress()` - Convert addresses to checksum format
   - `isValidAddress()` - Validate Ethereum addresses
   - `formatBalance()` - Format wei to ether
   - `parseToWei()` - Parse ether to wei

3. **`components/wallet-connect-button.tsx`** - Wallet Connect Button
   - Displays connection status
   - Shows connected wallet address
   - Dropdown menu for disconnecting

4. **`components/wallet-sign-in.tsx`** - Wallet Sign-In Component
   - Sign-in flow using wallet signature
   - Message signature verification
   - User creation/authentication

5. **`components/layout-provider.tsx`** - Layout Provider
   - Wraps the application with Web3Provider

6. **`app/api/auth/wallet/route.ts`** - Wallet Authentication API
   - Verifies wallet signatures
   - Creates/retrieves users by wallet address
   - Issues authentication tokens

## Usage

### Basic Setup

The Web3Provider is already configured in the root layout. Users can now use Web3 features throughout the app.

### Connecting a Wallet

Users can connect their MetaMask wallet using the `WalletConnectButton` component:

```tsx
import { WalletConnectButton } from '@/components/wallet-connect-button'

export function MyComponent() {
  return <WalletConnectButton />
}
```

### Using the Web3 Hook

Access wallet information and functions in any client component:

```tsx
'use client'

import { useWeb3 } from '@/lib/web3-context'

export function MyComponent() {
  const { account, isConnected, connect, disconnect, signer } = useWeb3()
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### Sign-In with Wallet

Users can sign in with their wallet using the `WalletSignIn` component:

```tsx
import { WalletSignIn } from '@/components/wallet-sign-in'

export function LoginPage() {
  return <WalletSignIn />
}
```

## How It Works

1. **User connects wallet** - User clicks "Connect Wallet" button
2. **MetaMask dialog appears** - User approves connection in MetaMask
3. **Provider initialized** - ethers.js BrowserProvider created
4. **User signs message** - User signs authentication message
5. **Signature verified** - Backend verifies signature matches address
6. **User authenticated** - User created/retrieved from database
7. **Session created** - User authenticated and redirected

## Environment Requirements

- MetaMask browser extension installed (or other EIP-6902 compatible wallet)
- User's browser must support `window.ethereum`
- Supported chains: Ethereum Mainnet, Sepolia, and other EVM chains

## Security Considerations

1. **Message Signing** - Users sign a message with a nonce to prevent replay attacks
2. **Signature Verification** - All signatures verified server-side
3. **Address Checksum** - All addresses stored in checksum format
4. **Nonce Generation** - Unique nonce for each authentication attempt

## Database Schema

Users authenticated via wallet should have the following fields:

```sql
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(42) UNIQUE;
ALTER TABLE users ADD COLUMN is_web3_user BOOLEAN DEFAULT false;
```

## Testing

### Local Testing Steps

1. **Install MetaMask** - https://metamask.io/
2. **Connect to test network** - Use Sepolia or Hardhat
3. **Click "Connect Wallet"** - Grant permission
4. **Sign message** - Approve signature in MetaMask
5. **Verify sign-in** - Should redirect to dashboard

### Test Addresses

Use test addresses from MetaMask's test networks or create a test account.

## Troubleshooting

### MetaMask Not Detected

- Ensure MetaMask extension is installed
- Check browser console for errors
- Try refreshing the page

### Connection Fails

- Verify MetaMask is unlocked
- Check network selection (Mainnet, Sepolia, etc.)
- Review browser console for error messages

### Signature Verification Fails

- Ensure message matches exactly
- Verify nonce hasn't expired
- Check address checksum format

### API Errors

- Check database connectivity
- Verify user table structure
- Review server logs

## Dependencies Added

- `ethers: ^6.11.1` - Ethereum library for Web3 interactions

## Next Steps

1. **Update database schema** - Add wallet_address field to users table
2. **Test wallet connection** - Use MetaMask or test network
3. **Customize sign-in message** - Modify domain/message in `createSignInMessage()`
4. **Add chain selection** - Allow users to switch networks
5. **Implement gas-free transactions** - Use relayers for transaction signing
6. **Add multiple chain support** - Support Polygon, Arbitrum, etc.

## References

- [MetaMask Developer Docs](https://docs.metamask.io/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [EIP-6902 Wallet Standard](https://eips.ethereum.org/EIPS/eip-6902)
