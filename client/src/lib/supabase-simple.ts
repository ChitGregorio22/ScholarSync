import { createClient } from '@supabase/supabase-js';

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
// COURSES CRUD (Using Local Backend)
// ============================================

export async function getCourses() {
  const session = await getSession();
  if (!session) return [];

  try {
    const response = await fetch(`${API_URL}/courses`, {
      headers: { 
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw data;
    
    localStorage.setItem('ss_cached_courses', JSON.stringify(data));
    return data;
  } catch (error) {
    const cached = localStorage.getItem('ss_cached_courses');
    return cached ? JSON.parse(cached) : [];
  }
}

// Add other CRUD operations as needed...
// For now, let's keep the remaining functions using the direct client 
// as they are less likely to hang once the session is established.

export async function createCourse(course: {
  course_name: string;
  course_code?: string;
  credits?: number;
  target_grade?: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('courses')
    .insert({ ...course, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: any) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// ASSESSMENTS CRUD
// ============================================

export async function getAssessments(courseId: string) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAssessment(assessment: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('assessments')
    .insert({ ...assessment, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssessment(id: string, updates: any) {
  const { data, error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssessment(id: string) {
  const { error } = await supabase.from('assessments').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// STUDY LOGS CRUD
// ============================================

export async function getStudyLogs(courseId?: string) {
  let query = supabase.from('study_logs').select('*').order('date', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createStudyLog(log: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('study_logs')
    .insert({ ...log, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudyLog(id: string) {
  const { error } = await supabase.from('study_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// PROFILE & CHAT
// ============================================

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user?.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChatHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveChatMessage(message: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('chat_history')
    .insert({ ...message, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentDataForAI() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Use the RPC call we defined in schema
  const { data, error } = await supabase.rpc('get_student_data_for_ai', { 
    p_user_id: user.id 
  });
  if (error) throw error;
  return data;
}
