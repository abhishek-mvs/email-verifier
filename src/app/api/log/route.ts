import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const logEntry = await request.json();
    // Forward the log to the server-side logger
    if (logEntry.level === 'error') {
      logger.error(logEntry.message, logEntry.error, logEntry.context);
    } else {
      logger.info(logEntry.message, logEntry.context);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the error but don't expose it to the client
    logger.error('Failed to process client log', error as Error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 