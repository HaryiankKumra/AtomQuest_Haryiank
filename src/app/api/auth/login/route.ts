export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 });
    }

    const { email, password } = body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      department: user.department,
      manager_id: user.manager_id,
    });

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      manager_id: user.manager_id,
    });
  } catch (err: any) {
    console.error('[/api/auth/login] Error:', err?.message);
    // Surface config errors clearly
    if (err?.message?.includes('Supabase env vars missing') || err?.message?.includes('Missing Supabase')) {
      return NextResponse.json(
        { detail: 'Server configuration error: Supabase environment variables not set. Check Vercel dashboard → Environment Variables.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ detail: 'Internal server error. Check server logs.' }, { status: 500 });
  }
}
