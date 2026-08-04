'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- MOCK CLIENT FOR OFFLINE / ZERO-SETUP MODE ---
class MockSupabaseQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAscending = true;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any = null;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getLocalStorageKey() {
    return `mock_sb_${this.tableName}`;
  }

  private getData(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.getLocalStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveData(data: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  select(columns: string = '*') {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
      this.action = 'select';
    }
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => item[column] === value);
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderField = column;
    this.orderAscending = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      let data = this.getData();

      if (this.action === 'select') {
        // Apply filters
        for (const filter of this.filters) {
          data = data.filter(filter);
        }

        // Apply ordering
        if (this.orderField) {
          data.sort((a, b) => {
            const valA = a[this.orderField!];
            const valB = b[this.orderField!];
            if (valA < valB) return this.orderAscending ? -1 : 1;
            if (valA > valB) return this.orderAscending ? 1 : -1;
            return 0;
          });
        }

        if (this.isSingle) {
          resolve({ data: data[0] || null, error: data[0] ? null : new Error('Row not found') });
        } else if (this.isMaybeSingle) {
          resolve({ data: data[0] || null, error: null });
        } else {
          resolve({ data, error: null });
        }
      } else if (this.action === 'insert') {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedRows = rows.map((row) => {
          // Generate unique ID if not present
          const id = row.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
          return {
            id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...row,
          };
        });

        this.saveData([...data, ...insertedRows]);
        const returned = Array.isArray(this.payload) ? insertedRows : insertedRows[0];
        resolve({ data: returned, error: null });
      } else if (this.action === 'update') {
        const updatedData = data.map((item) => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          if (matches) {
            return {
              ...item,
              ...this.payload,
              updated_at: new Date().toISOString(),
            };
          }
          return item;
        });

        this.saveData(updatedData);

        const returnedData = updatedData.filter((item) => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          return matches;
        });

        if (this.isSingle) {
          resolve({ data: returnedData[0] || null, error: null });
        } else if (this.isMaybeSingle) {
          resolve({ data: returnedData[0] || null, error: null });
        } else {
          resolve({ data: returnedData, error: null });
        }
      } else if (this.action === 'delete') {
        const remainingData = data.filter((item) => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          return !matches;
        });

        this.saveData(remainingData);
        resolve({ data: null, error: null });
      }
    } catch (e) {
      resolve({ data: null, error: e });
    }
  }
}

class MockSupabaseAuth {
  private listeners: Set<(event: string, session: any) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'mock_sb_session') {
          const session = this.getSessionSync();
          this.triggerListeners(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        }
      });
    }
  }

  private getSessionSync() {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('mock_sb_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveSessionSync(session: any) {
    if (typeof window === 'undefined') return;
    try {
      if (session) {
        localStorage.setItem('mock_sb_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('mock_sb_session');
      }
    } catch {}
  }

  private triggerListeners(event: string, session: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (e) {
        console.error(e);
      }
    });
  }

  async getSession() {
    const session = this.getSessionSync();
    return { data: { session }, error: null };
  }

  async signInWithPassword({ email }: { email: string }) {
    const userId = 'mock_user_' + Math.random().toString(36).substring(2, 11);
    const mockUser = {
      id: userId,
      email: email,
      created_at: new Date().toISOString(),
    };
    const session = {
      access_token: 'mock_jwt_token_' + Math.random().toString(36).substring(2, 15),
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };
    this.saveSessionSync(session);
    this.triggerListeners('SIGNED_IN', session);
    return { data: { user: mockUser, session }, error: null };
  }

  async signUp({ email }: { email: string }) {
    return this.signInWithPassword({ email });
  }

  async signOut() {
    this.saveSessionSync(null);
    this.triggerListeners('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.add(callback);
    const session = this.getSessionSync();
    // Execute callback asynchronously to avoid blocking initialization
    setTimeout(() => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }
}

const mockSupabaseClient = {
  auth: new MockSupabaseAuth(),
  from: (tableName: string) => new MockSupabaseQueryBuilder(tableName),
};

// --- INITIALIZE REAL OR MOCK CLIENT ---
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : (mockSupabaseClient as any);

