import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  if (typeof process !== "undefined" && process.env["NEXT_PUBLIC_SUPABASE_URL"]) {
    return process.env["NEXT_PUBLIC_SUPABASE_URL"];
  }
  throw new Error("SUPABASE_URL is not defined");
}

function getSupabaseAnonKey(): string {
  if (typeof process !== "undefined" && process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
    return process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  }
  throw new Error("SUPABASE_ANON_KEY is not defined");
}

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
