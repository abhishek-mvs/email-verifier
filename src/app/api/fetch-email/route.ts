import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { google } from 'googleapis';
import { parseGmailResponse } from '@/lib/email-parser';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(req: Request) {
  try {
    // Get the JWT token from the header
    const magicToken = req.headers.get('x-magic-token');
    
    if (!magicToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify and decode the JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(magicToken, JWT_SECRET) as {
        accessToken: string;
        refreshToken: string;
      };
    } catch (err: unknown) {
      logger.error('Invalid token', err instanceof Error ? err : new Error(String(err)));
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { recipientEmail, subject } = await req.json();

    if (!recipientEmail || !subject) {
      return NextResponse.json(
        { error: 'Recipient email and subject are required' },
        { status: 400 }
      );
    }

    // Initialize the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );

    // Set the credentials using the tokens from the JWT
    oauth2Client.setCredentials({
      access_token: decodedToken.accessToken,
      refresh_token: decodedToken.refreshToken,
      token_type: 'Bearer',
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for the email
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${recipientEmail} subject:${subject}`,
      maxResults: 1,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Get the email details
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: response.data.messages[0].id!,
    });

    // Parse the email response into a structured format
    const structuredEmail = parseGmailResponse(email.data as any);

    logger.info(`Email fetched successfully ${JSON.stringify(structuredEmail)}`);

    return NextResponse.json(structuredEmail);
  } catch (error) {
    logger.error('Error fetching email', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
} 