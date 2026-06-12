import { NextResponse } from "next/server";

const SUPABASE_PROJECT_URL = "https://eovubrcjtclkcuzvmzbk.supabase.co";

export function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_PROJECT_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  });
}
