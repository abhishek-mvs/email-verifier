import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

const isServer = typeof window === 'undefined';

const logToConsole = (level: string, data: any) => {
  if (isServer) {
    process.stdout.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      ...data,
    }) + '\n');
  } else {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      ...data,
    }));
  }
};

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
  debug: false,
  logger: {
    error(code: any, metadata: any) {
      logToConsole('error', { code, metadata });
    },
    warn(code: any) {
      // Disable warning logs
    },
    debug(code: any, metadata: any) {
      // Disable debug logs
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      // Ensure baseUrl matches our deployment URL
      const deploymentUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
      const actualBaseUrl = deploymentUrl.replace(/\/$/, '');

      // If the URL is relative, prefix it with the base URL
      if (url.startsWith('/')) {
        return `${actualBaseUrl}${url}`;
      }

      // If it's an absolute URL to our domain, use it
      if (url.startsWith(actualBaseUrl)) {
        return url;
      }

      // Default to home page
      return actualBaseUrl;
    },
    async session({ session, user, token }: any) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    },
    async jwt({ token, user, account }: any) {
      // Initial sign in
      if (account && user) {
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