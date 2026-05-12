import { getSession } from './supabase-simple';
import type { Database } from '../types/supabase';

const API_URL = 'http://localhost:5000/api';

// ============================================
// TYPES
// ============================================

export interface StudentContext {
  profile: Database['public']['Tables']['profiles']['Row'] | null;
  courses: Array<{
    course: Database['public']['Tables']['courses']['Row'];
    assessments: Database['public']['Tables']['assessments']['Row'][];
    study_logs: Database['public']['Tables']['study_logs']['Row'][];
  }> | null;
}

// ============================================
// SYSTEM PROMPT (Keep here for context if needed, but primary is on server)
// ============================================

export function formatStudentContext(context: StudentContext): string {
  if (!context.courses || context.courses.length === 0) {
    return 'No academic data available. The student has not added any courses or grades yet.';
  }

  let formatted = '';

  // Profile info
  if (context.profile) {
    formatted += `## Student Profile\n`;
    formatted += `Name: ${context.profile.full_name || 'Not provided'}\n`;
    if (context.profile.institution) formatted += `Institution: ${context.profile.institution}\n`;
    if (context.profile.major) formatted += `Major: ${context.profile.major}\n`;
    formatted += `\n`;
  }

  // Course details
  formatted += `## Academic Data\n\n`;
  
  for (const item of context.courses) {
    const course = item.course;
    const assessments = item.assessments || [];
    formatted += `### ${course.course_name} (${course.course_code || 'No Code'})\n`;
    formatted += `- Target Grade: ${course.target_grade || 'Not set'}\n`;
    
    if (assessments.length > 0) {
      formatted += `\n**Assessments:**\n`;
      for (const assessment of assessments) {
        const percentage = ((assessment.score / assessment.total_points) * 100).toFixed(1);
        formatted += `- ${assessment.name}: ${assessment.score}/${assessment.total_points} (${percentage}%)\n`;
      }
    }
    formatted += `\n---\n\n`;
  }

  return formatted;
}

// ============================================
// GET AI ADVICE (Using Local Backend)
// ============================================

export async function getAIAdvice(
  studentContext: StudentContext,
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  modelType?: string
): Promise<string> {
  try {
    const session = await getSession();
    const token = session?.access_token;

    const formattedContext = formatStudentContext(studentContext);
    const prompt = `Here is the student's current academic data:\n\n${formattedContext}\n\nStudent's question: ${userMessage}`;

    const response = await fetch(`${API_URL}/ai/advice`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ prompt, history: chatHistory, modelType })
    });


    const data = await response.json();
    if (!response.ok) throw data;
    
    return data.text;

  } catch (error: any) {
    console.error('AI API error:', error);
    throw new Error(error.error || 'Failed to get AI advice. Please try again.');
  }
}

// ... (Other functions like generateStudyPlan can be simplified or proxied similarly)
export async function getQuickAdvice(
  type: string,
  studentContext: StudentContext
): Promise<string> {
  const templates: any = {
    studyTips: 'What are the best study techniques for my courses?',
    timeManagement: 'How should I manage my study time across all courses?',
    gradeImprovement: 'How can I improve my grades in my weakest courses?',
  };
  return getAIAdvice(studentContext, templates[type] || 'Give me academic advice.');
}
