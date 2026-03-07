import StatCard from '../../components/StatCard';

export default function AdminDashboardTab({ users, courses, students, lecturers, onTabChange }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Users"     value={users.length}     color="indigo" />
        <StatCard label="Students"        value={students.length}  color="green"  />
        <StatCard label="Lecturers"       value={lecturers.length} color="yellow" />
        <StatCard label="Total Courses"   value={courses.length}   color="indigo" />
      </div>

      {/* Recent Users */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Users</h3>
        <button onClick={() => onTabChange('users')}
          className="text-sm text-indigo-600 hover:underline">View all →</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-5 py-3 text-gray-500">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                    user.role === 'admin'    ? 'bg-red-100 text-red-600' :
                    user.role === 'lecturer' ? 'bg-green-100 text-green-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>{user.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Courses */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Courses</h3>
        <button onClick={() => onTabChange('courses')}
          className="text-sm text-indigo-600 hover:underline">View all →</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Title</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Code</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Lecturer</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.slice(0, 5).map(course => (
              <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{course.title}</td>
                <td className="px-5 py-3 text-gray-500">{course.code}</td>
                <td className="px-5 py-3 text-gray-500">{course.lecturer?.name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    course.status === 'active'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>{course.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
