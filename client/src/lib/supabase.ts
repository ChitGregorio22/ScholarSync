import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

export type { Database };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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

export async function createCourse(course: Database['public']['Tables']['courses']['Insert']) {
  const { data, error } = await supabase
    .from('courses')
    .insert([course as any])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: Database['public']['Tables']['courses']['Update']) {
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
    .select('*, courses!inner(course_name)')
    .order('created_at', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAssessment(assessment: Database['public']['Tables']['assessments']['Insert']) {
  const { data, error } = await supabase
    .from('assessments')
    .insert([assessment as any])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAssessment(id: string, updates: Database['public']['Tables']['assessments']['Update']) {
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
    .select('*, courses!inner(course_name)')
    .order('date', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createStudyLog(studyLog: Database['public']['Tables']['study_logs']['Insert']) {
  const { data, error } = await supabase
    .from('study_logs')
    .insert([studyLog as any])
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

export async function getChatHistory(limit: number = 50) {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function saveChatMessage(message: Database['public']['Tables']['chat_history']['Insert']) {
  const { data, error } = await supabase
    .from('chat_history')
    .insert([message as any])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function clearChatHistory() {
  const { error } = await supabase
    .from('chat_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
  
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

export async function updateProfile(updates: Database['public']['Tables']['profiles']['Update']) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as any)
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// AI CONTEXT DATA
// ============================================

export async function getStudentDataForAI() {
  const { data, error } = await supabase
    .rpc('get_student_data_for_ai');
  
  if (error) throw error;
  return data;
}
