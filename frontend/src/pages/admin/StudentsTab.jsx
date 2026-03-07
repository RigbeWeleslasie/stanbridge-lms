import { useState } from 'react';

export default function StudentsTab({ students, courses, enrollments, onEnrollStudent, onBulkEnroll, onUnenroll }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse]   = useState('');
  const [bulkCourse, setBulkCourse]           = useState('');
  const [bulkStudents, setBulkStudents]       = useState([]);
  const [showBulk, setShowBulk]               = useState(false);
  const [message, setMessage]                 = useState('');
  const [search, setSearch]                   = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) return;
    try {
      await onEnrollStudent(selectedStudent.id, parseInt(selectedCourse));
      showMessage(`${selectedStudent.name} enrolled successfully!`);
      setSelectedCourse('');
    } catch (err) {
      showMessage(err.message);
    }
  };

  const handleUnenroll = async (userId, courseId) => {
    if (!confirm('Remove this student from the course?')) return;
    try {
      await onUnenroll(userId, courseId);
      showMessage('Student unenrolled!');
    } catch (err) {
      showMessage(err.message);
    }
  };

  const handleBulkEnroll = async () => {
    if (!bulkCourse || bulkStudents.length === 0) return;
    try {
      const res = await onBulkEnroll(bulkStudents, parseInt(bulkCourse));
      showMessage(res.message);
      setBulkStudents([]);
      setBulkCourse('');
      setShowBulk(false);
    } catch (err) {
      showMessage(err.message);
    }
  };

  const getStudentEnrollments = (studentId) =>
    enrollments.filter(e => e.user_id === studentId || e.student?.id === studentId);

  const isEnrolled = (studentId, courseId) =>
    enrollments.some(e => (e.user_id === studentId || e.student?.id === studentId) && e.course_id === courseId);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students</h2>
          <p className="text-sm text-gray-500 mt-1">Manage student enrollments</p>
        </div>
        <button onClick={() => setShowBulk(!showBulk)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
          Bulk Enroll
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Bulk Enroll */}
      {showBulk && (
        <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Bulk Enroll Students</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Select Course</label>
              <select value={bulkCourse} onChange={e => setBulkCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">Choose a course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Select Students ({bulkStudents.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-50">
                {students.map(student => (
                  <label key={student.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox"
                      checked={bulkStudents.includes(student.id)}
                      onChange={e => setBulkStudents(prev =>
                        e.target.checked
                          ? [...prev, student.id]
                          : prev.filter(id => id !== student.id)
                      )} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBulkEnroll}
                disabled={!bulkCourse || bulkStudents.length === 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                Enroll {bulkStudents.length} Students
              </button>
              <button onClick={() => setShowBulk(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredStudents.map((student, i) => (
              <div key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                  selectedStudent?.id === student.id
                    ? 'bg-indigo-50 border-l-4 border-indigo-600'
                    : 'hover:bg-gray-50'
                } ${i < filteredStudents.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {student.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{student.name}</p>
                  <p className="text-xs text-gray-400 truncate">{student.email}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {getStudentEnrollments(student.id).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Detail */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200 h-full flex items-center justify-center">
              <div>
                <p className="text-4xl mb-2"></p>
                <p>Select a student to manage their enrollments</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {/* Student Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {selectedStudent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Enroll into course */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Enroll in a Course
                </label>
                <div className="flex gap-2">
                  <select value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">Select a course</option>
                    {courses
                      .filter(c => !isEnrolled(selectedStudent.id, c.id))
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.code})
                        </option>
                      ))}
                  </select>
                  <button onClick={handleEnroll} disabled={!selectedCourse}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                    Enroll
                  </button>
                </div>
              </div>

              {/* Current Enrollments */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Enrolled Courses ({getStudentEnrollments(selectedStudent.id).length})
                </h4>
                {getStudentEnrollments(selectedStudent.id).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Not enrolled in any courses yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getStudentEnrollments(selectedStudent.id).map(enrollment => (
                      <div key={enrollment.id}
                        className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {enrollment.course?.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {enrollment.course?.code} · 👨‍🏫 {enrollment.course?.lecturer?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnenroll(selectedStudent.id, enrollment.course_id)}
                          className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
