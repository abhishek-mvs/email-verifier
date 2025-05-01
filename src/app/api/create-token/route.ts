import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Access token and refresh token are required' },
        { status: 400 }
      );
    }

    // Create a JWT that contains both tokens
    const token = jwt.sign(
      {
        accessToken,
        refreshToken,
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    console.log("token", token);
    logger.info('JWT token created successfully');

    return NextResponse.json({ token });
  } catch (error) {
    logger.error('Error creating JWT token', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
} 