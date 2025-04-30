import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  console.log('Fetch Email - Token:', token);
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipientEmail, subject } = await req.json();

  if (!recipientEmail || !subject) {
    return NextResponse.json(
      { error: 'Recipient email and subject are required' },
      { status: 400 }
    );
  }

  try {
    // Create a new OAuth2 client with client ID and secret
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );
    
    console.log('Fetch Email - Access Token:', token.accessToken);
    console.log('Fetch Email - Refresh Token:', token.refreshToken);
    
    // Set the credentials using the access token from the token
    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      token_type: 'Bearer',
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const query = `to:${recipientEmail} subject:"${subject}"`;
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 1,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json(
        { error: 'No matching emails found' },
        { status: 404 }
      );
    }

    const messageId = response.data.messages[0].id;
    if (!messageId) {
      return NextResponse.json(
        { error: 'No message ID found' },
        { status: 404 }
      );
    }

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    if (!message.data) {
      return NextResponse.json(
        { error: 'No message data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      snippet: message.data.snippet,
      payload: message.data.payload,
    });
  } catch (error) {
    console.error('Failed to fetch email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
} 