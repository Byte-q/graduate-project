import 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      role?: string;
      // add other user properties as needed
    }
    interface Request {
      isAuthenticated(): boolean;
      user?: User;
    }
  }
}