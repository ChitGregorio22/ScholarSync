import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { Database } from '../types/supabase';

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Missing Gemini API key. AI features will not work. Get a free key at https://ai.google.dev/');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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

export interface AIResponse {
  advice: string;
  actionItems: string[];
  suggestedStudyHours?: number;
  priorityCourses?: string[];
}

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are ScholarSync, an expert AI Academic Advisor. Your role is to help students improve their academic performance through personalized, data-driven advice.

## Core Responsibilities:
1. Analyze student grades and identify patterns
2. Calculate current standings and predict final grades
3. Identify at-risk courses that need immediate attention
4. Create personalized study plans
5. Provide actionable, specific advice (not generic tips)

## Analysis Framework:
- Calculate weighted averages for each course
- Compare current performance to target grades
- Identify which assessments have the most impact on final grades
- Analyze study time correlation with performance
- Flag courses where student is underperforming

## Response Guidelines:
- Be encouraging but honest about performance gaps
- Always reference specific courses and grades from the data
- Provide concrete next steps, not vague suggestions
- Calculate exactly what scores are needed on remaining assessments
- Suggest realistic study schedules based on credit hours
- Use grade calculation formulas when relevant

## Tone:
- Professional yet friendly
- Motivational but realistic
- Focus on improvement strategies
- Celebrate successes while addressing weaknesses`;

// ============================================
// FORMAT CONTEXT FOR AI
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
    if (context.profile.student_id) formatted += `Student ID: ${context.profile.student_id}\n`;
    formatted += `\n`;
  }

  // Course details
  formatted += `## Academic Data\n\n`;
  
  for (const item of context.courses) {
    const course = item.course;
    const assessments = item.assessments || [];
    const studyLogs = item.study_logs || [];

    formatted += `### ${course.course_name} (${course.course_code || 'No Code'})\n`;
    formatted += `- Credits: ${course.credits || 'N/A'}\n`;
    formatted += `- Target Grade: ${course.target_grade || 'Not set'}\n`;
    if (course.description) formatted += `- Description: ${course.description}\n`;

    // Calculate current grade
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    if (assessments.length > 0) {
      formatted += `\n**Assessments:**\n`;
      for (const assessment of assessments) {
        const percentage = ((assessment.score / assessment.total_points) * 100).toFixed(1);
        formatted += `- ${assessment.name} (${assessment.type}): ${assessment.score}/${assessment.total_points} = ${percentage}%`;
        if (assessment.weight) {
          formatted += ` (Weight: ${assessment.weight}%)`;
          totalWeightedScore += (assessment.score / assessment.total_points) * assessment.weight;
          totalWeight += assessment.weight;
        }
        formatted += `\n`;
      }
      
      if (totalWeight > 0) {
        const currentGrade = (totalWeightedScore / totalWeight * 100).toFixed(1);
        formatted += `\n**Current Weighted Grade:** ${currentGrade}% (${totalWeight}% of grade determined)\n`;
      }
    } else {
      formatted += `\n*No assessments recorded yet*\n`;
    }

    // Study logs
    if (studyLogs.length > 0) {
      const totalHours = studyLogs.reduce((sum, log) => sum + log.hours_studied, 0);
      const avgHoursPerSession = (totalHours / studyLogs.length).toFixed(1);
      formatted += `\n**Study Activity:** ${totalHours.toFixed(1)} total hours across ${studyLogs.length} sessions (avg: ${avgHoursPerSession}h/session)\n`;
    }

    formatted += `\n---\n\n`;
  }

  return formatted;
}

// ============================================
// GET AI ADVICE
// ============================================

export async function getAIAdvice(
  studentContext: StudentContext,
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings,
    });

    // Format the context
    const formattedContext = formatStudentContext(studentContext);

    // Build conversation history
    const history = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am ScholarSync, your AI Academic Advisor. I will analyze your academic data and provide personalized, actionable advice to help you improve your grades.' }],
        },
        ...history,
      ],
    });

    // Send the current message with context
    const prompt = `Here is the student's current academic data:\n\n${formattedContext}\n\nStudent's question: ${userMessage}\n\nProvide personalized advice based on their specific grades, courses, and goals.`;

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    return response;

  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in .env');
      }
      if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later or check your usage limits.');
      }
    }
    
    throw new Error('Failed to get AI advice. Please try again.');
  }
}

// ============================================
// GET STUDY PLAN
// ============================================

export async function generateStudyPlan(
  studentContext: StudentContext,
  timeframe: 'week' | 'month' | 'semester' = 'week'
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    safetySettings,
  });

  const formattedContext = formatStudentContext(studentContext);

  const prompt = `${SYSTEM_PROMPT}

Based on this student's academic data:

${formattedContext}

Generate a detailed ${timeframe}ly study plan that:
1. Prioritizes courses where they are behind or at risk
2. Allocates study hours based on course credits and difficulty
3. Schedules time for upcoming assessments
4. Includes specific study techniques for their weak areas
5. Balances review of past material with preparation for upcoming work

Provide the plan in a clear, structured format.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ============================================
// PREDICT FINAL GRADE
// ============================================

export async function predictFinalGrade(
  studentContext: StudentContext,
  courseId: string
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    safetySettings,
  });

  const courseData = studentContext.courses?.find(c => c.course.id === courseId);
  
  if (!courseData) {
    throw new Error('Course not found in student data');
  }

  const formattedContext = formatStudentContext(studentContext);

  const prompt = `${SYSTEM_PROMPT}

Based on the student's academic data:

${formattedContext}

Focus specifically on ${courseData.course.course_name}. Calculate:
1. Current grade based on completed assessments
2. What scores are needed on remaining assessments to achieve their target grade
3. Probability of reaching target grade based on current trajectory
4. Specific recommendations to improve chances

Show all calculations clearly.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ============================================
// QUICK ADVICE TEMPLATES
// ============================================

export const quickAdviceTemplates = {
  studyTips: 'What are the best study techniques for my courses?',
  timeManagement: 'How should I manage my study time across all courses?',
  gradeImprovement: 'How can I improve my grades in my weakest courses?',
  examPrep: 'How should I prepare for my upcoming exams?',
  balance: 'How can I balance my workload across all my courses?',
  motivation: 'I\'m feeling overwhelmed. Can you help me prioritize?',
};

export async function getQuickAdvice(
  type: keyof typeof quickAdviceTemplates,
  studentContext: StudentContext
): Promise<string> {
  const template = quickAdviceTemplates[type];
  return getAIAdvice(studentContext, template);
}
