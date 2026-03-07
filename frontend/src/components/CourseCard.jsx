export default function CourseCard({ course, enrolled = false, onEnroll }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          enrolled
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {enrolled ? 'Enrolled' : course.status}
        </span>
        <span className="text-xs text-gray-400">{course.code}</span>
      </div>
      <h4 className="font-semibold text-gray-800 mt-2">{course.title}</h4>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
      <p className="text-xs text-gray-400 mt-3">{course.lecturer?.name}</p>
      {!enrolled && onEnroll && (
        <button
          onClick={() => onEnroll(course.id)}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition">
          Enroll Now
        </button>
      )}
    </div>
  );
}
