import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      // If already authenticated, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Get the base URL
    const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
    
    // Create the Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID!);
    googleAuthUrl.searchParams.append('redirect_uri', `${baseUrl}/api/auth/callback/google`);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');

    // Return a page that will open the auth URL in a new window
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to Google...</title>
          <script>
            window.location.href = '${googleAuthUrl.toString()}';
          </script>
        </head>
        <body>
          <p>Redirecting to Google authentication...</p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in Reclaim auth route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 