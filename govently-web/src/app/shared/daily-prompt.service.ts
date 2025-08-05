import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../core/auth/supabase-client';

@Injectable({
  providedIn: 'root'
})
export class DailyPromptService {

  constructor(
    private supabase: SupabaseService // Assuming SupabaseService is already defined in your project
  ) {}

  /**
   * Fetch today's prompt from Supabase table
   */
  private fetchTodayPrompt(): Observable<string | null> {
    const today = new Date().toISOString().split('T')[0];

    return from(
      this.supabase.client
        .from('daily_prompts')
        .select('prompt, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data) {
          console.error("Error fetching today's prompt:", error);
          return of(null);
        }
        const createdAtDate = data.created_at.split('T')[0];
        return of(createdAtDate === today ? data.prompt : null);
      })
    );
  }

  /**
   * Public method to get today's prompt (or generate if not found)
   */
  getPrompt(): Observable<string> {
    return this.fetchTodayPrompt().pipe(
      switchMap(prompt => {
        if (prompt) {
          return of(prompt);
        }

        console.log("No prompt for today. Triggering generation...");
        return from(
          fetch(`${this.supabase.supabaseUrl}/functions/v1/daily_prompt_generation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).then(res => res.json())
        ).pipe(
          switchMap((result: any) => {
            if (result.error) {
              throw new Error(result.error || "Prompt generation failed");
            }
            return of(result.prompt);
          }),
          catchError(err => {
            console.error("Error generating prompt:", err);
            return of("Reflect on something meaningful today 🌱");
          })
        );
      }),
      catchError(err => {
        console.error("Unexpected error:", err);
        return of("Reflect on something meaningful today 🌱");
      })
    );
  }
}
