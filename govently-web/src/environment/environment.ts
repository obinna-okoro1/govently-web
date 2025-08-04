interface ImportMetaEnv {
  readonly SUPABASEURL: string;
  readonly SUPABASEKEY: string;
  // add other env variables here if needed
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const environment = {
  production: false,
  supabaseUrl: import.meta.env.SUPABASEURL || '',
  supabaseKey: import.meta.env.SUPABASEKEY || '',
};