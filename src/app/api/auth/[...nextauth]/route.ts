import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

console.log('[Debug] NextAuth Configuration Loading...');
console.log('[Debug] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[Debug] Current Environment:', process.env.NODE_ENV);

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
  debug: true, // Enable debug logs
  logger: {
    error(code, metadata) {
      console.error('[Auth Error]', code, metadata);
    },
    warn(code) {
      console.warn('[Auth Warning]', code);
    },
    debug(code, metadata) {
      console.log('[Auth Debug]', code, metadata);
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
      console.log('[Debug] Redirect Callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, user, token }) {
      console.log('[Debug] Session Callback:', { session, user, token });
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log('[Debug] JWT Callback:', { 
        token,
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile 
      });
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 