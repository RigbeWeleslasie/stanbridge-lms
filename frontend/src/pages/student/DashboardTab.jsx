import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import CourseCard from '../../components/CourseCard';

export default function DashboardTab({ courses, assignments, availableCourses, onTabChange }) {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {user?.name}!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Enrolled Courses"  value={courses.length}          color="indigo" />
        <StatCard label="Total Assignments" value={assignments.length}      color="yellow" />
        <StatCard label="Available Courses" value={availableCourses.length} color="green"  />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">My Courses</h3>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          You are not enrolled in any courses yet.
          <button onClick={() => onTabChange('browse')}
            className="block mx-auto mt-3 text-indigo-600 font-medium hover:underline">
            Browse courses →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(enrollment => (
            <CourseCard key={enrollment.id} course={enrollment.course} enrolled={true} />
          ))}
        </div>
      )}
    </div>
  );
}
