const SUPABASE_URL =
"https://lwapucgvumvdzgrarfew.supabase.co/rest/v1/";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YXB1Y2d2dW12ZHpncmFyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDE1MzgsImV4cCI6MjEwOTM3NzUzOH0.AgOcttxnkxvOFnH3_I62cKLC8vnC5BBbh_kDIQj5_1o";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
