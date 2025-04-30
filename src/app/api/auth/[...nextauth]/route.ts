import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

console.log('[Debug] NextAuth Configuration Loading...');
console.log('[Debug] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[Debug] Current Environment:', process.env.NODE_ENV);
console.log('[Debug] Vercel URL:', process.env.VERCEL_URL);

const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
console.log('[Debug] Base URL being used:', baseUrl);

const handler = NextAuth({
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
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[Auth Error]', { code, metadata });
    },
    warn(code) {
      console.warn('[Auth Warning]', code);
    },
    debug(code, metadata) {
      console.log('[Auth Debug]', { code, metadata });
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('[Debug] Sign In Callback:', {
        user,
        accountProvider: account?.provider,
        profile,
        email,
        hasCredentials: !!credentials,
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('[Debug] Redirect Callback - Initial:', { url, baseUrl });
      
      // Ensure baseUrl matches our deployment URL
      const deploymentUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
      const actualBaseUrl = deploymentUrl.replace(/\/$/, '');
      
      console.log('[Debug] Redirect Callback - URLs:', {
        originalUrl: url,
        originalBaseUrl: baseUrl,
        deploymentUrl,
        actualBaseUrl,
      });

      // If the URL is relative, prefix it with the base URL
      if (url.startsWith('/')) {
        const finalUrl = `${actualBaseUrl}${url}`;
        console.log('[Debug] Redirect Callback - Relative URL:', finalUrl);
        return finalUrl;
      }

      // If it's an absolute URL to our domain, use it
      if (url.startsWith(actualBaseUrl)) {
        console.log('[Debug] Redirect Callback - Valid Absolute URL:', url);
        return url;
      }

      // Default to home page
      console.log('[Debug] Redirect Callback - Defaulting to base URL:', actualBaseUrl);
      return actualBaseUrl;
    },
    async session({ session, user, token }) {
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
      
      // Ensure token is added to session
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    },
    async jwt({ token, user, account }) {
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

      // Initial sign in
      if (account && user) {
        console.log('[Debug] JWT Callback - Initial Sign In');
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
});

export { handler as GET, handler as POST }; 