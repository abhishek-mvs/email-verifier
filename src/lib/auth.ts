import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code: any, metadata: any) {
      console.error('[Auth Error]', { code, metadata });
    },
    warn(code: any) {
      console.warn('[Auth Warning]', code);
    },
    debug(code: any, metadata: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth Debug]', { code, metadata });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Sign In Callback:', {
          user,
          accountProvider: account?.provider,
          profile,
          email,
          hasCredentials: !!credentials,
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Redirect Callback - Initial:', { url, baseUrl });
      }
      
      // Ensure baseUrl matches our deployment URL
      const deploymentUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
      const actualBaseUrl = deploymentUrl.replace(/\/$/, '');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Redirect Callback - URLs:', {
          originalUrl: url,
          originalBaseUrl: baseUrl,
          deploymentUrl,
          actualBaseUrl,
        });
      }

      // If the URL is relative, prefix it with the base URL
      if (url.startsWith('/')) {
        const finalUrl = `${actualBaseUrl}${url}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('[Debug] Redirect Callback - Relative URL:', finalUrl);
        }
        return finalUrl;
      }

      // If it's an absolute URL to our domain, use it
      if (url.startsWith(actualBaseUrl)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Debug] Redirect Callback - Valid Absolute URL:', url);
        }
        return url;
      }

      // Default to home page
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Redirect Callback - Defaulting to base URL:', actualBaseUrl);
      }
      return actualBaseUrl;
    },
    async session({ session, user, token }: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Session Callback:', {
          sessionUser: session?.user,
          user,
          tokenSubset: {
            ...token,
            // Exclude sensitive data from logs
            accessToken: token.accessToken ? '[EXISTS]' : '[MISSING]',
            refreshToken: token.refreshToken ? '[EXISTS]' : '[MISSING]',
          },
        });
      }
      
      // Ensure token is added to session
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    },
    async jwt({ token, user, account }: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] JWT Callback:', {
          hasUser: !!user,
          hasAccount: !!account,
          tokenSubset: {
            ...token,
            // Exclude sensitive data from logs
            accessToken: token.accessToken ? '[EXISTS]' : '[MISSING]',
            refreshToken: token.refreshToken ? '[EXISTS]' : '[MISSING]',
          },
        });
      }

      // Initial sign in
      if (account && user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Debug] JWT Callback - Initial Sign In');
        }
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }

      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
}; 