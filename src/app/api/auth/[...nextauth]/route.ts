import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/gmail.readonly openid email profile',
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('JWT Callback - Account:', account);
      console.log('JWT Callback - Token before:', token);
      
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
      }
      
      console.log('JWT Callback - Token after:', token);
      return token;
    },
    async session({ session, token, user }) {
      console.log('Session Callback - Token:', token);
      console.log('Session Callback - Session before:', session);
      
      const newSession = {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
      
      console.log('Session Callback - Session after:', newSession);
      return newSession;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true, // Enable debug logs
});

export { handler as GET, handler as POST }; 