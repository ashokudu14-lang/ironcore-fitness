import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://xdvmqysxxbtbrteykzbx.supabase.co";
const fallbackPublishableKey = "sb_publishable_l4BhbbVD46cCQqUSvTmqBQ_GOXVluf9";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || fallbackPublishableKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
