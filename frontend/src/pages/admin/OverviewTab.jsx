import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

export default function OverviewTab({
  students, lecturers, courses, semesters,
  submissions, pendingSubmissions, activeSemester,
  onTabChange,
}) {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
        {activeSemester && (
          <p className="text-sm text-gray-500 mt-1">
            Active Semester: <span className="font-medium text-indigo-600">{activeSemester.name}</span>
            {' '}· {new Date(activeSemester.start_date).toLocaleDateString()} — {new Date(activeSemester.end_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students"  value={students.length}          color="indigo" />
        <StatCard label="Lecturers"        value={lecturers.length}         color="green"  />
        <StatCard label="Courses"          value={courses.length}           color="yellow" />
        <StatCard label="Pending Grades"   value={pendingSubmissions.length} color="red"   />
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '+ New Course',   tab: 'courses',   color: 'bg-indigo-600' },
          { label: '+ New Semester', tab: 'semesters', color: 'bg-green-600'  },
          { label: 'Enroll Student', tab: 'students',  color: 'bg-yellow-500' },
          { label: 'Grade Work',     tab: 'submissions', color: 'bg-red-500'  },
        ].map(action => (
          <button key={action.tab} onClick={() => onTabChange(action.tab)}
            className={`${action.color} text-white text-sm font-medium py-3 px-4 rounded-xl hover:opacity-90 transition`}>
            {action.label}
          </button>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Recent Students</h3>
            <button onClick={() => onTabChange('students')}
              className="text-sm text-indigo-600 hover:underline">View all →</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {students.slice(0, 5).map((student, i) => (
              <div key={student.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < 4 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                  {student.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{student.name}</p>
                  <p className="text-xs text-gray-400 truncate">{student.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {student.enrollments?.length || 0} courses
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Courses</h3>
            <button onClick={() => onTabChange('courses')}
              className="text-sm text-indigo-600 hover:underline">View all →</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {courses.slice(0, 5).map((course, i) => (
              <div key={course.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < 4 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-sm">
                  {course.code?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 truncate">{course.lecturer?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  course.status === 'active'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>{course.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
