interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: EmailHeader[];
  body: {
    size: number;
    data?: string;
  };
}

interface GmailPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: EmailHeader[];
  body: {
    size: number;
  };
  parts?: EmailPart[];
}

interface GmailResponse {
  id?: string | null;
  threadId?: string | null;
  labelIds?: string[];
  snippet?: string | null;
  payload?: GmailPayload;
  sizeEstimate?: number;
  historyId?: string;
  internalDate?: string;
}

export interface StructuredEmail {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  };
  subject: string;
  date: string;
  snippet: string;
  content: {
    text?: string;
    html?: string;
  };
}

function getHeaderValue(headers: EmailHeader[], name: string): string {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function parseEmailAddress(address: string): { name: string; email: string } {
  const match = address.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
  if (match) {
    return {
      name: match[1] || '',
      email: match[2] || '',
    };
  }
  return {
    name: '',
    email: address,
  };
}

function decodeBase64(data: string): string {
  try {
    return Buffer.from(data, 'base64').toString('utf-8');
  } catch (error) {
    return '';
  }
}

export function parseGmailResponse(response: GmailResponse): StructuredEmail {
  if (!response.payload?.headers) {
    throw new Error('Invalid email response: missing payload or headers');
  }

  const headers = response.payload.headers;
  
  // Get basic email information
  const from = parseEmailAddress(getHeaderValue(headers, 'From'));
  const to = parseEmailAddress(getHeaderValue(headers, 'To'));
  const subject = getHeaderValue(headers, 'Subject');
  const date = getHeaderValue(headers, 'Date');

  // Initialize content object
  const content: { text?: string; html?: string } = {};

  // Process email parts to get content
  if (response.payload.parts) {
    for (const part of response.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        content.text = decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body.data) {
        content.html = decodeBase64(part.body.data);
      }
    }
  }

  return {
    id: response.id || '',
    threadId: response.threadId || '',
    from,
    to,
    subject,
    date,
    snippet: response.snippet || '',
    content,
  };
} 