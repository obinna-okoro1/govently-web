import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  from,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  switchMap,
  takeLast,
  tap,
} from 'rxjs/operators';

import {
  AuthError,
  AuthResponse,
  Session,
  User,
} from '@supabase/supabase-js';
import { SupabaseService } from './supabase-client';

export type Gender = 'male' | 'female' | 'non-binary' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  userId: string;
  name: string;
  gender: Gender;
  age: number;
  city: string;
  country: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null); // Cache for user profile
  private isRefreshing = false; // Flag to track token refresh state

  // Inactivity timer
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor(
    private readonly supabase: SupabaseService
  ) {
    this.initializeAuth();
    this.setupActivityListeners(); // Start tracking user activity
  }

  /**
   * Initialize auth state tracking
   */
  private initializeAuth(): void {
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.sessionSubject.next(session);
      console.log('Auth state changed:', event);

      // Clear cached user profile on sign-out
      if (event === 'SIGNED_OUT') {
        this.userProfileSubject.next(null);
      }

      // Fetch and cache user profile on sign-in
      if (event === 'SIGNED_IN' && session?.user) {
        this.fetchAndCacheUserProfile(session.user);
        this.resetInactivityTimer(); // Reset the inactivity timer on sign-in
      }
    });
  }

  /**
   * Set up activity listeners to track user interaction
   */
  private setupActivityListeners(): void {
    window.addEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.addEventListener('keypress', this.resetInactivityTimer.bind(this));
    window.addEventListener('click', this.resetInactivityTimer.bind(this));
  }

  /**
   * Reset the inactivity timer
   */
  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimer); // Clear the existing timer
    this.inactivityTimer = setTimeout(() => {
      this.logoutUserDueToInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Log out the user due to inactivity
   */
  private async logoutUserDueToInactivity(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('User logged out due to inactivity');
      this.userProfileSubject.next(null); // Clear cached user profile
      window.location.href = '/login'; // Redirect to login page
    }
  }

  /**
   * Fetch and cache the user profile
   */
private fetchAndCacheUserProfile(user: User): void {
  from(
    this.supabase.client
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
  )
    .pipe(
      map(({ data, error }) => {
        if (error || !data) {
          throw new Error('Profile not found');
        }

        return {
          ...data,
          userId: data.user_id
        };
      }),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        this.clearAuthTokenDueToMissingUser();
        return of(null);
      })
    )
    .subscribe((userProfile) => {
      this.userProfileSubject.next(userProfile);
    });
}

  /**
   * Get the current session as an Observable
   */
  public getSession(): Observable<Session | null> {
    return this.sessionSubject.asObservable();
  }

  /**
   * Get the cached user profile as an Observable
   */
  public getUserProfile(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }

  /**
   * User Sign Up
   */
  public signUp(userData: Omit<UserProfile, 'id' | 'userId' | 'created_at'>, password: string): Observable<AuthResponse> {
    return from(
      this.supabase.client.auth.signUp({
        email: userData.email,
        password,
        options: {
          data: {
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            age: userData.age,
            city: userData.city,
            country: userData.country
          },
        },
      })
    ).pipe(
      switchMap((authResponse: AuthResponse) => {
        console.log('Supabase response:', authResponse); // Log Supabase response
        if (authResponse.error) {
          console.error('Supabase error:', authResponse.error); // Log detailed error
          throw new Error(authResponse.error.message);
        }

        // Cache the user profile after successful sign-up
        if (authResponse.data.user) {
          this.fetchAndCacheUserProfile(authResponse.data.user);
        }

        return of(authResponse);
      }),
      catchError((error) => {
        console.error('Error during sign-up:', error);
        throw new Error(error.message);
      })
    );
  }

  /**
   * User Sign In
   */
  public signIn(login: { email: string; password: string }): Observable<AuthResponse> {
    return from(this.supabase.client.auth.signInWithPassword(login)).pipe(
      tap((authResponse) => {
        // Cache the user profile after successful sign-in
        if (authResponse.data.user) {
          this.fetchAndCacheUserProfile(authResponse.data.user);
        }
        this.resetInactivityTimer(); // Reset the inactivity timer on sign-in
      }),
      catchError((error) => {
        console.error('Error during sign-in:', error);
        throw new Error(error.message);
      })
    );
  }

  public getUserById(userId: string): Observable<User | null> {
    // Check if the user is authenticated
    const session = this.sessionSubject.value;
    if (!session || !session.user) {
      console.error('User is not authenticated');
      return of(null); // Return null if the user is not authenticated
    }

    // Fetch the user by ID
    const query = this.supabase.client
      .from('auth.users') // Assuming the table is named 'users'
      .select('*')
      .eq('id', userId)
      .single();

    return from(query).pipe(
      map((response: any) => {
        console.log(response.data);

        if (!response.data) {
          return null; // Return null if user is not found
        }
        return response.data; // Return the raw user data
      }),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return of(null); // Return null in case of an error
      })
    );
  }

  /**
   * User Sign Out
   */
  public signOut(): Observable<{ error: AuthError | null }> {
    return from(this.supabase.client.auth.signOut()).pipe(
      tap(() => {
        // Clear the cached user profile on sign-out
        this.userProfileSubject.next(null);
        clearTimeout(this.inactivityTimer); // Clear the inactivity timer
      }),
      catchError((error) => {
        console.error('Error during sign-out:', error);
        throw new Error(error.message);
      })
    );
  }

  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
  const session = this.sessionSubject.value;
  return !!session?.user;
}

  /**
   * Refresh the session (e.g., when the token expires)
   */
  public refreshSession(): Observable<Session | null> {
    if (this.isRefreshing) {
      return of(null); // Ignore concurrent refresh requests
    }

    this.isRefreshing = true;
    return from(this.supabase.client.auth.refreshSession()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.session;
      }),
      tap((session) => {
  if (session?.user) {
    this.fetchAndCacheUserProfile(session.user);
  } else {
    this.clearAuthTokenDueToMissingUser(); // <- sets sessionSubject to null
  }
}),
      catchError((error) => {
        console.error('Error refreshing session:', error);
        return of(null);
      }),
      finalize(() => {
        this.isRefreshing = false; // Reset the flag
      })
    );
  }

  /**
   * Check if the token is expired
   */
  private isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  }

  /**
   * Get the authentication token (with automatic refresh if expired)
   */
  getAuthToken(): Observable<string | null> {
    return from(this.supabase.client.auth.getSession()).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.session) return of(null);

        if (this.isTokenExpired(data.session.access_token)) {
          return this.refreshSession().pipe(
            map((newSession) => newSession?.access_token || null)
          );
        } else {
          return of(data.session.access_token);
        }
      }),
      catchError((error) => {
        console.error('Error fetching token:', error);
        return of(null);
      })
    );
  }

  private clearAuthTokenDueToMissingUser(): void {
  this.supabase.client.auth.signOut().then(({ error }) => {
    if (error) {
      console.error('Failed to clear auth token:', error.message);
    } else {
      console.warn('Auth token cleared due to missing user.');
      this.sessionSubject.next(null);
      this.userProfileSubject.next(null);
      window.location.href = '/login'; // Optional redirect
    }
  });
}
}