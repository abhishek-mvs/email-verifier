# Email Fetcher

A Next.js application that allows users to fetch and view emails from their Gmail account using Google OAuth authentication.

## Features

- Google OAuth Authentication
- Email search by recipient and subject
- Clean and modern UI
- Secure token handling
- Responsive design

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3000/api/auth/signin/google
     ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Create new project
   - Import your repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `next build`

3. Configure Environment Variables in Vercel:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-domain.vercel.app)

4. Update Google OAuth Configuration:
   - Go to Google Cloud Console
   - Add additional authorized redirect URIs:
     ```
     https://your-domain.vercel.app/api/auth/callback/google
     https://your-domain.vercel.app/api/auth/signin/google
     ```

5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |

## Security Notes

- Never commit `.env` file to version control
- Keep your `NEXTAUTH_SECRET` secure and unique per environment
- Regularly rotate your Google OAuth credentials
- Monitor your Google Cloud Console for unusual activity
