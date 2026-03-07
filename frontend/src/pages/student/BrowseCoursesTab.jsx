import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function BrowseCoursesTab({ onEnrollmentRequested }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [message, setMessage]     = useState('');

  useEffect(() => { fetchAvailable(); }, []);

  const fetchAvailable = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/available');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (courseId) => {
    setRequesting(courseId);
    try {
      await api.post(`/courses/${courseId}/request`);
      setMessage('Enrollment request submitted! Waiting for admin approval.');
      setTimeout(() => setMessage(''), 4000);
      await fetchAvailable();
      if (onEnrollmentRequested) onEnrollmentRequested();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setRequesting(null);
    }
  };

  if (loading) return (
    <div className="text-center text-gray-400 py-8">Loading courses...</div>
  );

  const { courses, enrollment_open, enrollment_end, semester } = data || {};

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse Courses</h2>

      {/* Enrollment period banner */}
      {semester && (
        <div className={`mb-6 p-4 rounded-xl border ${
          enrollment_open
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold text-sm ${
                enrollment_open ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {enrollment_open ? 'Enrollment is Open!' : 'Enrollment is Closed'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {semester.name} · Enrollment period:{' '}
                {new Date(semester.enrollment_start).toLocaleDateString()} —{' '}
                {new Date(semester.enrollment_end).toLocaleDateString()}
              </p>
            </div>
            {enrollment_open && enrollment_end && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="text-sm font-semibold text-red-600">
                  {new Date(enrollment_end).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!semester && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500">
            No active semester. Enrollment is currently closed.
          </p>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('submitted')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Courses grid */}
      {!courses || courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No courses available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const status = course.enrollment_status;

            return (
              <div key={course.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {course.code}
                  </span>
                  {course.semester && (
                    <span className="text-xs text-gray-400">{course.semester.name}</span>
                  )}
                </div>

                <h4 className="font-semibold text-gray-800 mt-2">{course.title}</h4>
                <p className="text-sm text-gray-500 mt-1 flex-1">{course.description}</p>

                <div className="mt-3 text-xs text-gray-400">
                  {course.lecturer?.name}
                </div>

                <div className="mt-4">
                  {status === 'active' ? (
                    <div className="w-full text-center bg-green-100 text-green-700 text-sm font-medium py-2 rounded-lg">
                      Enrolled
                    </div>
                  ) : status === 'pending' ? (
                    <div className="w-full text-center bg-yellow-100 text-yellow-700 text-sm font-medium py-2 rounded-lg">
                      Pending Approval
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="w-full text-center bg-red-100 text-red-600 text-sm font-medium py-2 rounded-lg">
                      Request Rejected
                    </div>
                  ) : enrollment_open ? (
                    <button
                      onClick={() => handleRequest(course.id)}
                      disabled={requesting === course.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                      {requesting === course.id ? 'Requesting...' : 'Request Enrollment'}
                    </button>
                  ) : (
                    <div className="w-full text-center bg-gray-100 text-gray-400 text-sm py-2 rounded-lg">
                      Enrollment Closed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
