import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (verifyPassword(password)) {
      const sessionToken = hashPassword(password)
      
      return NextResponse.json(
        { success: true, token: sessionToken },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
