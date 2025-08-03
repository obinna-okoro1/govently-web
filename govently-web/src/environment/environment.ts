import { secrets } from './environment.secret';

export const environment = {
    production: false,
    supabaseUrl: secrets.supabaseUrl,
    supabaseKey: secrets.supabaseKey,
  };