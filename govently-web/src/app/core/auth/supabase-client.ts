import { Injectable } from '@angular/core';

import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

import { environment } from '../../../environment/environment';

const SUPABASE_URL = environment.supabaseUrl;
const SUPABASE_ANON_KEY = environment.supabaseKey;

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false, // Disable automatic token refresh
          persistSession: true, // Persist session in local storage
          detectSessionInUrl: false, // Disable session detection in URL
        },
      });

    // In SupabaseService constructor
this.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}