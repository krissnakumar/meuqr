import { createClient } from "@supabase/supabase-js";

// Initialize a privileged Supabase Admin client for secure background work
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://myrjmljrcxhutixxhacn.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cmptbGpyY3hodXRpeHhoYWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjAzNTgsImV4cCI6MjA5NTYzNjM1OH0.KPqs-myPKEEyLZQVHSnPGUYoeMNezfQfcwn_AJ12Yyk"
);
