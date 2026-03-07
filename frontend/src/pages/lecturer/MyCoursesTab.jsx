import { useState } from 'react';

export default function LecturerMyCoursesTab({ courses, students, assignments, onCreateCourse, onCreateAssignment }) {
  const [showCourseForm, setShowCourseForm]         = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedCourse, setSelectedCourse]         = useState(null);
  const [expandedCourse, setExpandedCourse]         = useState(null);
  const [courseForm, setCourseForm]                 = useState({ title: '', code: '', description: '' });
  const [assignmentForm, setAssignmentForm]         = useState({ title: '', description: '', due_date: '', total_marks: 100 });
  const [message, setMessage]                       = useState('');

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await onCreateCourse(courseForm);
      setShowCourseForm(false);
      setCourseForm({ title: '', code: '', description: '' });
      setMessage('Course created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await onCreateAssignment(selectedCourse, assignmentForm);
      setShowAssignmentForm(false);
      setAssignmentForm({ title: '', description: '', due_date: '', total_marks: 100 });
      setMessage('Assignment created! All enrolled students can now see it.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <button onClick={() => setShowCourseForm(!showCourseForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
          + New Course
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('success') || message.includes('students')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Create Course Form */}
      {showCourseForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Create New Course</h3>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <input value={courseForm.title}
              onChange={e => setCourseForm({...courseForm, title: e.target.value})}
              placeholder="Course Title" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <input value={courseForm.code}
              onChange={e => setCourseForm({...courseForm, code: e.target.value})}
              placeholder="Course Code (e.g. CS102)" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <textarea value={courseForm.description}
              onChange={e => setCourseForm({...courseForm, description: e.target.value})}
              placeholder="Description" rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="flex gap-2">
              <button type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Create
              </button>
              <button type="button" onClick={() => setShowCourseForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Assignment Form */}
      {showAssignmentForm && selectedCourse && (
        <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-1">Create Assignment</h3>
          <p className="text-xs text-gray-400 mb-4">
            All students enrolled in this course will see this assignment automatically.
          </p>
          <form onSubmit={handleCreateAssignment} className="space-y-3">
            <input value={assignmentForm.title}
              onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})}
              placeholder="Assignment Title" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <textarea value={assignmentForm.description}
              onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})}
              placeholder="Assignment Description / Instructions" rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <input type="date" value={assignmentForm.due_date}
                  onChange={e => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Total Marks</label>
                <input type="number" value={assignmentForm.total_marks}
                  onChange={e => setAssignmentForm({...assignmentForm, total_marks: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Create Assignment
              </button>
              <button type="button" onClick={() => setShowAssignmentForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No courses yet. Create your first course!
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => {
            const courseAssignments = assignments.filter(a => a.course_id === course.id);
            const courseStudents    = students[course.id] || [];
            const isExpanded        = expandedCourse === course.id;

            return (
              <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Course Header */}
                <div className="p-5 flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => setExpandedCourse(isExpanded ? null : course.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{course.title}</h4>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{course.code}</span>
                      <span className="text-xs text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    <p className="text-sm text-gray-500">{course.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{courseStudents.length} students</span>
                      <span>{courseAssignments.length} assignments</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    setSelectedCourse(course.id);
                    setShowAssignmentForm(true);
                    setExpandedCourse(course.id);
                  }}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition ml-4">
                    + Assignment
                  </button>
                </div>

                {/* Expanded: Assignments + Students */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">

                    {/* Assignments */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-600 mb-3">Assignments</h5>
                      {courseAssignments.length === 0 ? (
                        <p className="text-sm text-gray-400">No assignments yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {courseAssignments.map(assignment => (
                            <div key={assignment.id}
                              className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm text-gray-800">{assignment.title}</p>
                                <p className="text-xs text-gray-500">{assignment.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                  {assignment.total_marks} marks
                                </span>
                                {assignment.due_date && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                  </p>
                                )}
                                <p className="text-xs text-indigo-600 mt-1">
                                  {assignment.submissions_count || 0} submission(s)
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Enrolled Students */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-600 mb-3">👥 Enrolled Students</h5>
                      {courseStudents.length === 0 ? (
                        <p className="text-sm text-gray-400">No students enrolled yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {courseStudents.map(enrollment => (
                            <div key={enrollment.id}
                              className="bg-white rounded-lg p-3 border border-gray-100 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                                {enrollment.student?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{enrollment.student?.name}</p>
                                <p className="text-xs text-gray-400">{enrollment.student?.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
