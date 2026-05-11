import { useState, useEffect } from "react";
import { 
  getCourses, 
  createCourse, 
  deleteCourse, 
  getStudyLogs, 
  createStudyLog,
  deleteStudyLog,
  getProfile,
  updateProfile,
  type Course,
  type StudyLog,
  type Profile
} from "../lib/supabase-simple";

interface GradesProps {
  subjects?: any[];
  onSubjectsChange: () => void;
  onLogout: () => void;
}

export default function Grades({ onSubjectsChange, onLogout }: GradesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState("");
  const [targetGrade, setTargetGrade] = useState("");

  const [studyCourseId, setStudyCourseId] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyNotes, setStudyNotes] = useState("");

  // Profile states
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, logsData, profileData] = await Promise.all([
        getCourses(),
        getStudyLogs(),
        getProfile().catch(() => null) // Profile might not exist yet
      ]);
      
      setCourses(coursesData);
      setStudyLogs(logsData);
      
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setStudentId(profileData.student_id || "");
        setInstitution(profileData.institution || "");
        setMajor(profileData.major || "");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        student_id: studentId,
        institution,
        major
      });
      alert("Profile saved successfully!");
    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    }
  };

  // Add course
  const addCourse = async () => {
    if (!courseName.trim()) {
      alert("Please enter a course name");
      return;
    }

    try {
      await createCourse({
        course_name: courseName,
        course_code: courseCode || undefined,
        credits: credits ? parseInt(credits) : undefined,
        target_grade: targetGrade || undefined
      });
      
      // Reset form
      setCourseName("");
      setCourseCode("");
      setCredits("");
      setTargetGrade("");
      
      // Reload data
      await loadData();
      onSubjectsChange(); // Notify parent
    } catch (error: any) {
      alert("Error adding course: " + error.message);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    try {
      await deleteCourse(id);
      await loadData();
      onSubjectsChange();
    } catch (error: any) {
      alert("Error deleting course: " + error.message);
    }
  };

  // Add study log
  const addStudyLog = async () => {
    if (!studyCourseId || !studyHours) {
      alert("Please select a course and enter hours");
      return;
    }

    try {
      await createStudyLog({
        course_id: studyCourseId,
        hours_studied: parseFloat(studyHours),
        date: studyDate,
        notes: studyNotes || undefined
      });
      
      // Reset form
      setStudyHours("");
      setStudyNotes("");
      
      // Reload data
      await loadData();
    } catch (error: any) {
      alert("Error adding study log: " + error.message);
    }
  };

  // Delete study log
  const handleDeleteStudyLog = async (id: string) => {
    try {
      await deleteStudyLog(id);
      await loadData();
    } catch (error: any) {
      alert("Error deleting study log: " + error.message);
    }
  };

  // Calculate stats
  const totalStudyHours = studyLogs.reduce((sum, log) => sum + log.hours_studied, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">🎓 ScholarSync Dashboard</h1>

          <button
            onClick={onLogout}
            className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* PROFILE SECTION */}
        <div className="bg-[#1a1d23] p-5 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">👤 Student Profile</h2>
            <button
              onClick={handleSaveProfile}
              className="bg-emerald-500 px-3 py-1 rounded text-sm hover:bg-emerald-600 transition"
            >
              Save Profile
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="bg-black p-3 rounded"
            />
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className="bg-black p-3 rounded"
            />
            <input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Institution/University"
              className="bg-black p-3 rounded"
            />
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Major/Program (e.g. BSCS)"
              className="bg-black p-3 rounded"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1d23] p-4 rounded text-center">
            <div className="text-3xl font-bold text-emerald-400">{courses.length}</div>
            <div className="text-gray-400">Courses</div>
          </div>
          <div className="bg-[#1a1d23] p-4 rounded text-center">
            <div className="text-3xl font-bold text-blue-400">{totalStudyHours.toFixed(1)}</div>
            <div className="text-gray-400">Total Study Hours</div>
          </div>
          <div className="bg-[#1a1d23] p-4 rounded text-center">
            <div className="text-3xl font-bold text-purple-400">{studyLogs.length}</div>
            <div className="text-gray-400">Study Sessions</div>
          </div>
        </div>

        {/* ADD COURSE */}
        <div className="bg-[#1a1d23] p-5 rounded-xl mb-6">
          <h2 className="mb-3 font-semibold">📚 Add Course</h2>

          <div className="grid md:grid-cols-4 gap-3">
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course Name (e.g. Calculus I)"
              className="bg-black p-3 rounded"
            />
            <input
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="Course Code (e.g. MATH101)"
              className="bg-black p-3 rounded"
            />
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="Credits (e.g. 3)"
              className="bg-black p-3 rounded"
            />
            <input
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              placeholder="Target Grade (e.g. A)"
              className="bg-black p-3 rounded"
            />
          </div>

          <button
            onClick={addCourse}
            className="mt-3 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Add Course
          </button>
        </div>

        {/* COURSES LIST */}
        <div className="bg-[#1a1d23] p-5 rounded mb-6">
          <h2 className="mb-3 font-semibold">📋 Your Courses</h2>

          {courses.length === 0 ? (
            <p className="text-gray-400">No courses yet. Add your first course above!</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex justify-between items-center bg-black p-3 rounded"
                >
                  <div>
                    <div className="font-semibold">{course.course_name}</div>
                    <div className="text-sm text-gray-400">
                      {course.course_code && `${course.course_code} • `}
                      {course.credits && `${course.credits} credits`}
                      {course.target_grade && ` • Target: ${course.target_grade}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD STUDY LOG */}
        <div className="bg-[#1a1d23] p-5 rounded mb-6">
          <h2 className="mb-3 font-semibold">⏱️ Log Study Session</h2>

          <div className="grid md:grid-cols-4 gap-3">
            <select
              value={studyCourseId}
              onChange={(e) => setStudyCourseId(e.target.value)}
              className="bg-black p-3 rounded"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="bg-black p-3 rounded"
            />
            <input
              type="number"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              placeholder="Hours (e.g. 2.5)"
              className="bg-black p-3 rounded"
            />
            <button
              onClick={addStudyLog}
              className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600 transition"
            >
              Log Study
            </button>
          </div>
          <input
            value={studyNotes}
            onChange={(e) => setStudyNotes(e.target.value)}
            placeholder="Notes (optional): What did you study?"
            className="bg-black p-3 rounded w-full mt-3"
          />
        </div>

        {/* STUDY LOGS */}
        <div className="bg-[#1a1d23] p-5 rounded">
          <h2 className="mb-3 font-semibold">📊 Study History</h2>

          {studyLogs.length === 0 ? (
            <p className="text-gray-400">No study sessions logged yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {studyLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center bg-black p-3 rounded"
                >
                  <div>
                    <div className="font-semibold">
                      {courses.find(c => c.id === log.course_id)?.course_name || 'Unknown Course'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {log.date} • {log.hours_studied} hours
                      {log.notes && ` • ${log.notes}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudyLog(log.id)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}