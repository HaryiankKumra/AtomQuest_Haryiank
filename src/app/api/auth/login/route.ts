import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
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
}
