type LogLevel = 'info' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const logEntry = this.formatLog(level, message, context, error);
    
    if (this.isServer) {
      // Server-side logging
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    } else {
      // Client-side logging
      console.log(JSON.stringify(logEntry));
      // Also send to server if possible
      try {
        fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry),
        }).catch(() => {
          // Ignore errors when sending logs to server
        });
      } catch (e) {
        // Ignore errors when sending logs to server
      }
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }
}

export const logger = Logger.getInstance(); 