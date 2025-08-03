// src/common/types/auth-request.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}
