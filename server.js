const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const open = require('open');

dotenv.config();

const PORT = 8080;
const app = express();
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 1. Auth URL
app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
  res.redirect(url);
});

// 2. OAuth Callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Authentication successful! You can now make Gmail API calls.');
});

// 3. Fetch Email by recipient + subject
app.post('/fetch-email', async (req, res) => {
  const { recipientEmail, subject } = req.body;

  if (!oauth2Client.credentials) {
    return res.status(401).send('User not authenticated. Go to /auth first.');
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const query = `to:${recipientEmail} subject:"${subject}"`;
    console.log('Query:', query);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 1,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return res.status(404).send('No matching emails found.');
    }

    const messageId = response.data.messages[0].id;
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const snippet = message.data.snippet;
    const payload = message.data.payload;

    res.json({ snippet, payload });
  } catch (err) {
    console.error('Failed to fetch email:', err);
    res.status(500).send('Error fetching email.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/auth to start OAuth`);
});