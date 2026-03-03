/**
 * Supabase-Client-Konfiguration
 *
 * Verwendet den in auth.js initialisierten Client (window._supabaseAuth),
 * damit Auth-Session und Daten-Queries denselben Client nutzen.
 */

const supabase = window._supabaseAuth
  || window.supabase.createClient(
    document.querySelector('meta[name="supabase-url"]')?.content || 'https://kwwyyuqwrkgyyaxnaipe.supabase.co',
    document.querySelector('meta[name="supabase-anon-key"]')?.content || 'sb_publishable_eapfujf9HCWaFhMLZmQaVQ_FvcBiDnD'
  );

export { supabase };
