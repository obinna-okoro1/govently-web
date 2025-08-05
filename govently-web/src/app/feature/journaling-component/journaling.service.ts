import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../core/auth/supabase-client';

export interface JournalEntry {
  id: string;
  user_id: string;
  prompt?: string | null;
  mood?: string | null;
  entry?: string | null;
  burn_after?: boolean;
  created_at?: string;
  updated_at?: string;
}


@Injectable({
  providedIn: 'root'
})
export class JournalingService {

  constructor(
    private supabase: SupabaseService
  ) {}

  /**
   * Create a new journal entry
   */
  createEntry(entry: Partial<JournalEntry>): Observable<JournalEntry | null> {
    return from(
      this.supabase.client
        .from('journal_entries')
        .insert([entry])
        .select()
        .single()
    ).pipe(map(({ data }) => data));
  }

  /**
   * Get all entries for the current user
   */
  getEntries(userId: string): Observable<JournalEntry[]> {
    return from(
      this.supabase.client
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ).pipe(map(({ data }) => data || []));
  }

  /**
   * Get a single entry by ID
   */
  getEntryById(id: string): Observable<JournalEntry | null> {
    return from(
      this.supabase.client
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(map(({ data }) => data));
  }

  /**
   * Update an entry by ID
   */
  updateEntry(id: string, updates: Partial<JournalEntry>): Observable<JournalEntry | null> {
    return from(
      this.supabase.client
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    ).pipe(map(({ data }) => data));
  }

  /**
   * Delete an entry (burn)
   */
  deleteEntry(id: string): Observable<boolean> {
    return from(
      this.supabase.client
        .from('journal_entries')
        .delete()
        .eq('id', id)
    ).pipe(map(({ error }) => !error));
  }
}
