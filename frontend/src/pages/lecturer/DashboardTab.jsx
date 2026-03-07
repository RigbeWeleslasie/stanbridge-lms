import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

export default function LecturerDashboardTab({ courses, pendingSubmissions, gradedSubmissions, totalStudents, onTabChange }) {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {user?.name}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="My Courses"          value={courses.length}              color="indigo" />
        <StatCard label="Total Students"      value={totalStudents}               color="green"  />
        <StatCard label="Pending Submissions" value={pendingSubmissions.length}   color="yellow" />
        <StatCard label="Graded"              value={gradedSubmissions.length}    color="indigo" />
      </div>

      {/* Pending Submissions Preview */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Pending Submissions</h3>
        <button onClick={() => onTabChange('submissions')}
          className="text-sm text-indigo-600 hover:underline">View all →</button>
      </div>

      {pendingSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No pending submissions
        </div>
      ) : (
        <div className="space-y-3">
          {pendingSubmissions.slice(0, 5).map(sub => (
            <div key={sub.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{sub.student?.name}</p>
                <p className="text-sm text-gray-500">{sub.assignment?.title} · {sub.course?.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  sub.status === 'late'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {sub.status}
                </span>
                <button onClick={() => onTabChange('submissions')}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700">
                  Grade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
