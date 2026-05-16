import { ethers } from 'ethers'

/**
 * Sign a message with the user's wallet
 */
export async function signMessage(signer: ethers.Signer, message: string): Promise<string> {
  try {
    const signature = await signer.signMessage(message)
    return signature
  } catch (error) {
    throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify a signed message
 */
export async function verifyMessage(message: string, signature: string): Promise<string> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress
  } catch (error) {
    throw new Error(`Failed to verify message: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a nonce for authentication
 */
export function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a sign-in message
 */
export function createSignInMessage(nonce: string, domain: string = 'team-management-system'): string {
  return `Sign this message to authenticate with ${domain}.\n\nNonce: ${nonce}`
}

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
  return ethers.getAddress(address)
}

/**
 * Check if an address is valid
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address)
}

/**
 * Format balance (from wei to ether)
 */
export function formatBalance(balance: string): string {
  return ethers.formatEther(balance)
}

/**
 * Parse user input amount to wei
 */
export function parseToWei(amount: string): string {
  return ethers.parseEther(amount).toString()
}
