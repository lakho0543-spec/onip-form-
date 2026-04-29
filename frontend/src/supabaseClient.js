import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btvrmwmvpptgqlbprimd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnJtd212cHB0Z3FsYnByaW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDMwNDEsImV4cCI6MjA5MDAxOTA0MX0.q8o2AOdfwgZ_H8pLpfSUcdAmVH-bCmlT1s6PbHWLjJs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);