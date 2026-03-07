import { useState } from 'react';
import Navbar              from '../../components/Navbar';
import useStudentDashboard from '../../hooks/useStudentDashboard';
import AssignmentsTab      from './AssignmentsTab';
import QuizzesTab          from './QuizzesTab';
import BrowseCoursesTab    from './BrowseCoursesTab';

const TABS = ['my courses', 'browse courses', 'assignments', 'quizzes'];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('my courses');
  const { courses, assignments, loading, error, refetch } = useStudentDashboard();

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
              {tab === 'assignments' && assignments.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                  {assignments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'my courses' && (
          <MyCoursesTab courses={courses} />
        )}
        {activeTab === 'browse courses' && (
          <BrowseCoursesTab onEnrollmentRequested={refetch} />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab assignments={assignments} />
        )}
        {activeTab === 'quizzes' && (
          <QuizzesTab courses={courses} />
        )}
      </div>
    </div>
  );
}

function MyCoursesTab({ courses }) {
  if (courses.length === 0) return (
    <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
      <p className="text-5xl mb-4"></p>
      <h3 className="font-semibold text-gray-700 mb-2">No Courses Yet</h3>
      <p className="text-sm text-gray-400 mb-4">
        You are not enrolled in any courses yet.
      </p>
      <p className="text-sm text-indigo-600 font-medium">
        → Browse Courses tab to request enrollment during the enrollment period.
      </p>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {course.code}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Enrolled
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 mt-2">{course.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between text-xs text-gray-400">
              <span>{course.lecturer?.name}</span>
              {course.semester && <span> {course.semester?.name}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
