import type { Session, User } from "better-auth";

export interface AuthSessionResult {
  session: Session;
  user: User;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: AuthSessionResult;
    }
  }
}

export {};
