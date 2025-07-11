import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
    // add any other session properties here
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    session: SessionData;
  }
}

declare global {
  var memoryCache: Map<string, { data: any; timestamp: number }>;
}

export {};