import { createClient } from '@supabase/supabase-js';

// --- TYPES ---
export interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  credits?: number;
  target_grade?: string;
  grade?: string;
  description?: string;
  created_at?: string;
}

export interface StudyLog {
  id: string;
  course_id: string;
  hours_studied: number;
  date: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = 'http://localhost:5000/api';

// Singleton pattern to avoid "Multiple GoTrueClient instances" warning
if (!(window as any)._supabaseInstance) {
  (window as any)._supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}
export const supabase = (window as any)._supabaseInstance;

// ============================================
// AUTH FUNCTIONS (Using Local Backend)
// ============================================

export async function signUp(email: string, password: string, fullName: string) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName })
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw data;
  
  // Save session locally for our own bypass logic
  if (data.session) {
    localStorage.setItem('ss_session', JSON.stringify(data.session));
    // Also try to update supabase client (non-blocking)
    supabase.auth.setSession(data.session).catch(() => {});
  }
  
  return data;
}

export async function signOut() {
  localStorage.removeItem('ss_session');
  await supabase.auth.signOut().catch(() => {});
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
    
    // Fallback: check backend if client-side check is stuck/fails
    const session = await getSession();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function getSession() {
  // Use our own manual storage to avoid Supabase SDK hanging
  const saved = localStorage.getItem('ss_session');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

// ============================================
// DATA FETCHING HELPERS
// ============================================

async function getAuthToken() {
  const session = await getSession();
  return session?.access_token;
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function proxyFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired or invalid
      console.warn("Session expired or unauthorized. Logging out...");
      signOut().then(() => {
        window.location.reload(); // Refresh to clear state
      });
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    console.error(`ProxyFetch error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================
// COURSES CRUD (Using Local Backend)
// ============================================

export async function getCourses(): Promise<Course[]> {
  try {
    const data = await proxyFetch<Course[]>('/courses');
    localStorage.setItem('ss_cached_courses', JSON.stringify(data));
    return data;
  } catch (error) {
    const cached = localStorage.getItem('ss_cached_courses');
    return cached ? JSON.parse(cached) : [];
  }
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  return proxyFetch<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  });
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  return proxyFetch<Course>(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function deleteCourse(id: string): Promise<{ status: string }> {
  return proxyFetch<{ status: string }>(`/courses/${id}`, { method: 'DELETE' });
}

// ============================================
// ASSESSMENTS CRUD (Using Local Backend)
// ============================================

export async function getAssessments(courseId: string): Promise<any[]> {
  return proxyFetch<any[]>(`/assessments/${courseId}`);
}

export async function createAssessment(assessment: any): Promise<any> {
  return proxyFetch<any>('/assessments', {
    method: 'POST',
    body: JSON.stringify(assessment)
  });
}

export async function updateAssessment(id: string, updates: any): Promise<any> {
  return proxyFetch<any>(`/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function deleteAssessment(id: string): Promise<{ status: string }> {
  return proxyFetch<{ status: string }>(`/assessments/${id}`, { method: 'DELETE' });
}

// ============================================
// STUDY LOGS CRUD (Using Local Backend)
// ============================================

export async function getStudyLogs(courseId?: string): Promise<StudyLog[]> {
  const url = courseId ? `/study-logs?courseId=${courseId}` : '/study-logs';
  return proxyFetch<StudyLog[]>(url);
}

export async function createStudyLog(log: Partial<StudyLog>): Promise<StudyLog> {
  return proxyFetch<StudyLog>('/study-logs', {
    method: 'POST',
    body: JSON.stringify(log)
  });
}

export async function deleteStudyLog(id: string): Promise<{ status: string }> {
  return proxyFetch<{ status: string }>(`/study-logs/${id}`, { method: 'DELETE' });
}

// ============================================
// PROFILE & CHAT (Using Local Backend)
// ============================================

export async function getProfile(): Promise<any> {
  return proxyFetch<any>('/profile');
}

export async function updateProfile(updates: any): Promise<any> {
  return proxyFetch<any>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  return proxyFetch<ChatMessage[]>('/chat/history');
}

export async function clearChatHistory(): Promise<{ status: string }> {
  return proxyFetch<{ status: string }>('/chat/history', { method: 'DELETE' });
}

export async function createTicket(ticketId: string, subject?: string, message?: string): Promise<any> {
  return proxyFetch<any>('/support/tickets', {
    method: 'POST',
    body: JSON.stringify({ ticketId, subject, message })
  });
}

export async function saveChatMessage(message: { role: string; content: string; context?: any }): Promise<ChatMessage> {
  return proxyFetch<ChatMessage>('/chat', {
    method: 'POST',
    body: JSON.stringify(message)
  });
}

export async function getStudentDataForAI(): Promise<any> {
  return proxyFetch<any>('/ai/student-data');
}

