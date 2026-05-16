import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyMessage, toChecksumAddress } from '@/lib/web3-utils'

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address')
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const checksumAddress = toChecksumAddress(address)

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: checksumAddress },
      select: { id: true }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: checksumAddress,
          email: `wallet-${checksumAddress.toLowerCase()}@team-management.local`,
          approvalStatus: 'pending',
        },
        select: { id: true }
      })
    }

    // Generate a nonce
    const nonceValue = Math.floor(Math.random() * 1000000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

    await prisma.nonce.create({
      data: {
        userId: user.id,
        value: nonceValue,
        expiresAt: expiresAt,
      }
    })

    return NextResponse.json({
      nonce: nonceValue,
      message: `Sign this message to authenticate with TPMS: ${nonceValue}`
    })
  } catch (error) {
    console.error('Error generating nonce:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, message, signature, nonce } = await request.json()

    if (!address || !message || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields: address, message, signature, nonce' },
        { status: 400 }
      )
    }

    // Verify the message contains the nonce to prevent replay attacks
    if (!message.includes(nonce)) {
      return NextResponse.json(
        { error: 'Invalid message: nonce mismatch' },
        { status: 400 }
      )
    }

    const checksumAddress = toChecksumAddress(address)

    // Find user and the specific nonce
    const user = await prisma.user.findUnique({
      where: { walletAddress: checksumAddress },
      include: {
        nonces: {
          where: {
            value: nonce,
            used: false,
            expiresAt: { gt: new Date() }
          },
          take: 1
        }
      }
    })

    if (!user || user.nonces.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      )
    }

    // Verify the signature
    const recoveredAddress = await verifyMessage(message, signature)
    const recoveredChecksumAddress = toChecksumAddress(recoveredAddress)

    if (checksumAddress !== recoveredChecksumAddress) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    // Mark nonce as used
    await prisma.nonce.update({
      where: { id: user.nonces[0].id },
      data: { used: true }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        address: checksumAddress,
        email: user.email,
        name: user.name,
        role: user.requestedRole // Placeholder for role
      },
    })
  } catch (error) {
    console.error('Wallet authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
