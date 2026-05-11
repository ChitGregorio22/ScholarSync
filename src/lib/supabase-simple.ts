import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTH HELPERS
// ============================================

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// ============================================
// COURSES CRUD
// ============================================

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createCourse(course: {
  course_name: string;
  course_code?: string;
  credits?: number;
  target_grade?: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('courses')
    .insert({ ...course, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: {
  course_name?: string;
  course_code?: string;
  credits?: number;
  target_grade?: string;
  description?: string;
}) {
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
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// ASSESSMENTS/GRADES CRUD
// ============================================

export async function getAssessments(courseId?: string) {
  let query = supabase
    .from('assessments')
    .select('*, courses(course_name)')
    .order('created_at', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAssessment(assessment: {
  course_id: string;
  type: string;
  name: string;
  score: number;
  total_points: number;
  weight?: number;
  date?: string;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('assessments')
    .insert({ ...assessment, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAssessment(id: string, updates: {
  type?: string;
  name?: string;
  score?: number;
  total_points?: number;
  weight?: number;
  date?: string;
  notes?: string;
}) {
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
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// STUDY LOGS CRUD
// ============================================

export async function getStudyLogs(courseId?: string) {
  let query = supabase
    .from('study_logs')
    .select('*, courses(course_name)')
    .order('date', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createStudyLog(studyLog: {
  course_id: string;
  hours_studied: number;
  date: string;
  notes?: string;
  topics_covered?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('study_logs')
    .insert({ ...studyLog, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteStudyLog(id: string) {
  const { error } = await supabase
    .from('study_logs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// CHAT HISTORY
// ============================================

export async function getChatHistory(limit = 50) {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function saveChatMessage(message: {
  role: 'user' | 'assistant';
  content: string;
  context?: object;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('chat_history')
    .insert({ ...message, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function clearChatHistory() {
  const { error } = await supabase
    .from('chat_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) throw error;
}

// ============================================
// PROFILE
// ============================================

export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(updates: {
  full_name?: string;
  student_id?: string;
  institution?: string;
  major?: string;
  avatar_url?: string;
}) {
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

// ============================================
// AI CONTEXT DATA
// ============================================

export async function getStudentDataForAI() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .rpc('get_student_data_for_ai', { p_user_id: user.id });
  
  if (error) throw error;
  return data;
}

// Simple types for use in components
export type Course = {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string | null;
  credits: number | null;
  target_grade: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type StudyLog = {
  id: string;
  user_id: string;
  course_id: string;
  hours_studied: number;
  date: string;
  notes: string | null;
  topics_covered: string | null;
  created_at: string;
  courses?: { course_name: string };
};

export type Profile = {
  id: string;
  full_name: string | null;
  student_id: string | null;
  institution: string | null;
  major: string | null;
  avatar_url: string | null;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  context: object | null;
  created_at: string;
};
