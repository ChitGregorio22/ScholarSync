import { createClient } from '@supabase/supabase-js';

// --- TYPES ---
export interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  credits?: number;
  target_grade?: string;
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function proxyFetch(endpoint: string, options: any = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

// ============================================
// COURSES CRUD (Using Local Backend)
// ============================================

export async function getCourses() {
  try {
    const data = await proxyFetch('/courses');
    localStorage.setItem('ss_cached_courses', JSON.stringify(data));
    return data;
  } catch (error) {
    const cached = localStorage.getItem('ss_cached_courses');
    return cached ? JSON.parse(cached) : [];
  }
}

export async function createCourse(course: any) {
  return proxyFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  });
}

export async function updateCourse(id: string, updates: any) {
  // We can add PATCH to server if needed, or use POST for now
  // For simplicity, let's just use the server's existing endpoints
  return proxyFetch(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function deleteCourse(id: string) {
  return proxyFetch(`/courses/${id}`, { method: 'DELETE' });
}

// ============================================
// ASSESSMENTS CRUD (Using Local Backend)
// ============================================

export async function getAssessments(courseId: string) {
  return proxyFetch(`/assessments/${courseId}`);
}

export async function createAssessment(assessment: any) {
  return proxyFetch('/assessments', {
    method: 'POST',
    body: JSON.stringify(assessment)
  });
}

export async function updateAssessment(id: string, updates: any) {
  return proxyFetch(`/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function deleteAssessment(id: string) {
  return proxyFetch(`/assessments/${id}`, { method: 'DELETE' });
}

// ============================================
// STUDY LOGS CRUD (Using Local Backend)
// ============================================

export async function getStudyLogs(courseId?: string) {
  const url = courseId ? `/study-logs?courseId=${courseId}` : '/study-logs';
  return proxyFetch(url);
}

export async function createStudyLog(log: any) {
  return proxyFetch('/study-logs', {
    method: 'POST',
    body: JSON.stringify(log)
  });
}

export async function deleteStudyLog(id: string) {
  return proxyFetch(`/study-logs/${id}`, { method: 'DELETE' });
}

// ============================================
// PROFILE & CHAT (Using Local Backend)
// ============================================

export async function getProfile() {
  return proxyFetch('/profile');
}

export async function updateProfile(updates: any) {
  return proxyFetch('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function getChatHistory() {
  return proxyFetch('/chat/history');
}

export async function saveChatMessage(message: any) {
  return proxyFetch('/chat', {
    method: 'POST',
    body: JSON.stringify(message)
  });
}

export async function getStudentDataForAI() {
  return proxyFetch('/ai/student-data');
}
