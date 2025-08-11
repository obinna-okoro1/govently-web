import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/auth/supabase-client';
import { AuthService } from '../../core/auth/auth-service';

export interface AIChatRequest {
  session_id: string;
  content: string;
  assistant_type: string;
  gender: string;
  date: string
}

export interface AIChatResponse {
  reply: string;
}

@Injectable()
export class AiChatService {
  private functionUrl: string;

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.functionUrl = `${this.supabaseService.supabaseUrl}/functions/v1/ai_chat_function`;
  }

  sendMessage(request: AIChatRequest): Observable<AIChatResponse> {
    console.log(request);
    
    return this.authService.getSession().pipe(
      switchMap((session) => {
        if (!session?.access_token) {
          return throwError(() => new Error('User is not authenticated.'));
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post<AIChatResponse>(this.functionUrl, request, { headers }).pipe(
          map((response) => response),
          catchError((err) => {
            console.error('AI chat error', err);
            return throwError(() => new Error('Failed to connect to AI assistant.'));
          })
        );
      })
    );
  }

  clearChat(user_id: string): void {
    from(this.supabaseService.client
      .from('ai_messages')
      .delete()
      .eq('user_id', user_id)
      .then(
        () => {
          return
        },
        (error) => {
          throwError(() => new Error('Failed to clear chat: ' + error.message));
        }
      ));
  }
}
