import { useState, useEffect } from 'react';
import Navbar            from '../../components/Navbar';
import useAdminDashboard from '../../hooks/useAdminDashboard';
import OverviewTab       from './OverviewTab';
import SemestersTab      from './SemestersTab';
import CoursesTab        from './CoursesTab';
import StudentsTab       from './StudentsTab';
import UsersTab          from './UsersTab';
import SubmissionsTab    from '../lecturer/SubmissionsTab';
import EnrollmentsTab    from './EnrollmentsTab';
import api               from '../../api/axios';

const TABS = ['overview', 'enrollments', 'semesters', 'courses', 'students', 'submissions', 'users'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab]       = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);
  const {
    students, lecturers, courses, semesters,
    enrollments, submissions,
    pendingSubmissions, activeSemester,
    loading, error,
    createSemester, updateSemester, deleteSemester,
    createCourse, updateCourse, deleteCourse,
    enrollStudent, bulkEnroll, unenrollStudent,
    gradeSubmission,
  } = useAdminDashboard();

  useEffect(() => { fetchPendingCount(); }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/enrollments/pending');
      setPendingCount(res.data.length);
    } catch { }
  };

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
              {tab === 'enrollments' && pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
              {tab === 'submissions' && pendingSubmissions.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            students={students} lecturers={lecturers}
            courses={courses} semesters={semesters}
            submissions={submissions}
            pendingSubmissions={pendingSubmissions}
            activeSemester={activeSemester}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'enrollments' && (
          <EnrollmentsTab />
        )}
        {activeTab === 'semesters' && (
          <SemestersTab
            semesters={semesters}
            onCreateSemester={createSemester}
            onUpdateSemester={updateSemester}
            onDeleteSemester={deleteSemester}
          />
        )}
        {activeTab === 'courses' && (
          <CoursesTab
            courses={courses}
            lecturers={lecturers}
            semesters={semesters}
            onCreateCourse={createCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={deleteCourse}
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            courses={courses}
            enrollments={enrollments}
            onEnrollStudent={enrollStudent}
            onBulkEnroll={bulkEnroll}
            onUnenroll={unenrollStudent}
          />
        )}
        {activeTab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onGrade={gradeSubmission}
          />
        )}
        {activeTab === 'users' && (
          <UsersTab users={[...students, ...lecturers]} />
        )}
      </div>
    </div>
  );
}
