import CourseCard from '../../components/CourseCard';

export default function MyCoursesTab({ courses, availableCourses, onEnroll, onTabChange }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          You are not enrolled in any courses yet.
          <button
            onClick={() => onTabChange('browse')}
            className="block mx-auto mt-3 text-indigo-600 font-medium hover:underline">
            Browse courses →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(enrollment => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              enrolled={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
