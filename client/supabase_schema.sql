-- AI Student Performance Advisor Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_name TEXT NOT NULL,
    course_code TEXT,
    credits INTEGER DEFAULT 3,
    target_grade TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own courses
CREATE POLICY "Users can only access their own courses" ON courses
    FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- 2. ASSESSMENTS/GRADES TABLE
-- ============================================
CREATE TABLE assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'Midterm', 'Assignment', 'Quiz', 'Final', 'Project', etc.
    name TEXT NOT NULL,
    score DECIMAL(5,2) NOT NULL, -- e.g., 85.50
    total_points DECIMAL(5,2) NOT NULL, -- e.g., 100.00
    weight DECIMAL(5,2), -- percentage weight of final grade, e.g., 20.00
    date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own assessments
CREATE POLICY "Users can only access their own assessments" ON assessments
    FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- 3. STUDY LOGS TABLE (Optional but useful for AI)
-- ============================================
CREATE TABLE study_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hours_studied DECIMAL(4,1) NOT NULL, -- e.g., 2.5 hours
    date DATE NOT NULL,
    notes TEXT,
    topics_covered TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own study logs
CREATE POLICY "Users can only access their own study logs" ON study_logs
    FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- 4. CHAT HISTORY TABLE
-- ============================================
CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context JSONB, -- stores current grades data used for this message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own chat history
CREATE POLICY "Users can only access their own chat history" ON chat_history
    FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- 5. USER PROFILES TABLE (Extended user info)
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    student_id TEXT,
    institution TEXT,
    major TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profile
CREATE POLICY "Users can only access their own profile" ON profiles
    FOR ALL
    USING (auth.uid() = id);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_course_id ON assessments(course_id);
CREATE INDEX idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX idx_study_logs_course_id ON study_logs(course_id);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. USER PROFILE CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. FUNCTION TO GET COMPLETE STUDENT DATA FOR AI
-- ============================================
CREATE OR REPLACE FUNCTION get_student_data_for_ai(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'profile', (SELECT row_to_json(profiles.*) FROM profiles WHERE id = p_user_id),
        'courses', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'course', row_to_json(c.*),
                    'assessments', (
                        SELECT jsonb_agg(row_to_json(a.*))
                        FROM assessments a
                        WHERE a.course_id = c.id
                    ),
                    'study_logs', (
                        SELECT jsonb_agg(row_to_json(s.*))
                        FROM study_logs s
                        WHERE s.course_id = c.id
                    )
                )
            )
            FROM courses c
            WHERE c.user_id = p_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
