import { useState } from 'react';
import Navbar               from '../../components/Navbar';
import useLecturerDashboard from '../../hooks/useLecturerDashboard';
import LecturerDashboardTab from './DashboardTab';
import LecturerMyCoursesTab from './MyCoursesTab';
import SubmissionsTab       from './SubmissionsTab';
import QuizBuilderTab       from './QuizBuilderTab';

const TABS = ['dashboard', 'my courses', 'submissions', 'quiz builder'];

export default function LecturerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    courses, assignments, submissions,
    pendingSubmissions, gradedSubmissions,
    students, totalStudents,
    loading, error,
    createCourse, createAssignment, gradeSubmission,
  } = useLecturerDashboard();

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-indigo-600 text-lg">
      Loading...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex gap-6 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab}
              {tab === 'submissions' && pendingSubmissions.length > 0 && (
                <span className="ml-2 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <LecturerDashboardTab
            courses={courses}
            pendingSubmissions={pendingSubmissions}
            gradedSubmissions={gradedSubmissions}
            totalStudents={totalStudents}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'my courses' && (
          <LecturerMyCoursesTab
            courses={courses}
            students={students}
            assignments={assignments}
            onCreateCourse={createCourse}
            onCreateAssignment={createAssignment}
          />
        )}
        {activeTab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onGrade={gradeSubmission}
          />
        )}
        {activeTab === 'quiz builder' && (
          <QuizBuilderTab courses={courses} />
        )}
      </div>
    </div>
  );
}
