const SUPABASE_URL =
"https://lwapucgvumvdzgrarfew.supabase.co/rest/v1/";

const SUPABASE_ANON_KEY =
"sb_publishable_hlgII0SbBrwOdM9K8b78zw_kE_OoDfM";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
