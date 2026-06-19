import { NextResponse } from 'next/server';

export async function GET() {
  // Return values strictly from environment variables without any hardcoded credentials
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY || '',
    macrodroidUrl: process.env.NEXT_PUBLIC_MACRODROID_URL || ''
  });
}

