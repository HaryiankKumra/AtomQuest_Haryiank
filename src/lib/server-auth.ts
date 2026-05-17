import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-gstp-secret-key-minimum-32-chars!!';

export interface JWTPayload {
  sub: string;       // user id
  role: string;
  email: string;
  name: string;
  department?: string;
  manager_id?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): JWTPayload | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ detail: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ detail: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ detail: message }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ detail: message }, { status: 400 });
}

export function unprocessable(message: string) {
  return NextResponse.json({ detail: message }, { status: 422 });
}

export function requireRole(
  user: JWTPayload | null,
  ...roles: string[]
): NextResponse | null {
  if (!user) return unauthorized();
  if (!roles.includes(user.role)) return forbidden(`Required role: ${roles.join(' or ')}`);
  return null;
}
