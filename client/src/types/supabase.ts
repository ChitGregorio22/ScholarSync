export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          user_id: string
          course_name: string
          course_code: string | null
          credits: number | null
          target_grade: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          course_name: string
          course_code?: string | null
          credits?: number | null
          target_grade?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_name?: string
          course_code?: string | null
          credits?: number | null
          target_grade?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          course_id: string
          user_id: string
          type: string
          name: string
          score: number
          total_points: number
          weight: number | null
          date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id?: string
          type: string
          name: string
          score: number
          total_points: number
          weight?: number | null
          date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          type?: string
          name?: string
          score?: number
          total_points?: number
          weight?: number | null
          date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_logs: {
        Row: {
          id: string
          course_id: string
          user_id: string
          hours_studied: number
          date: string
          notes: string | null
          topics_covered: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id?: string
          hours_studied: number
          date: string
          notes?: string | null
          topics_covered?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          hours_studied?: number
          date?: string
          notes?: string | null
          topics_covered?: string | null
          created_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          context: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          role: 'user' | 'assistant'
          content: string
          context?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          context?: Json | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          student_id: string | null
          institution: string | null
          major: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          student_id?: string | null
          institution?: string | null
          major?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          student_id?: string | null
          institution?: string | null
          major?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_data_for_ai: {
        Args: {
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
