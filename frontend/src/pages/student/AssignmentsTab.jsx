import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AssignmentsTab({ assignments }) {
  const [submitting, setSubmitting]   = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [form, setForm]               = useState({ content: '', file: null });
  const [message, setMessage]         = useState('');
  const [loading, setLoading]         = useState(true);

  // fetch existing submissions on load
  useEffect(() => {
    fetchMySubmissions();
  }, [assignments]);

  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      const results = {};
      await Promise.all(assignments.map(async (assignment) => {
        try {
          const res = await api.get(`/assignments/${assignment.id}/my-submission`);
          results[assignment.id] = res.data;
        } catch { /* not submitted yet */ }
      }));
      setSubmissions(results);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, assignmentId) => {
    e.preventDefault();
    setSubmitting(assignmentId);
    try {
      const formData = new FormData();
      if (form.content) formData.append('content', form.content);
      if (form.file)    formData.append('file', form.file);

      const res = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmissions({ ...submissions, [assignmentId]: res.data.submission });
      setForm({ content: '', file: null });
      setMessage('Submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSubmitting(null);
    }
  };

  const isOverdue = (due_date) => due_date && new Date(due_date) < new Date();

  if (loading) return (
    <div className="text-center text-gray-400 py-8">Loading assignments...</div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Assignments</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No assignments yet.
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => {
            const submission = submissions[assignment.id];
            const overdue    = isOverdue(assignment.due_date);
            const graded     = submission?.status === 'graded';
            const percentage = graded
              ? Math.round((submission.grade / assignment.total_marks) * 100)
              : null;

            return (
              <div key={assignment.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                      {submission && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          graded                          ? 'bg-green-100 text-green-700' :
                          submission.status === 'late'   ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {graded ? 'Graded' : submission.status === 'late' ? 'Late' : 'Submitted'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{assignment.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      {assignment.total_marks} marks
                    </span>
                    {assignment.due_date && (
                      <p className={`text-xs mt-1 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                        {overdue ? 'Overdue' : ''} {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grade Card */}
                {graded && (
                  <div className="bg-gradient-to-r from-indigo-50 to-green-50 border border-indigo-100 rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Your Grade</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-indigo-600">{submission.grade}</p>
                          <p className="text-gray-400 mb-1">/ {assignment.total_marks}</p>
                        </div>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                        percentage >= 75 ? 'bg-green-100 text-green-700' :
                        percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {percentage}%
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 pt-3 border-t border-indigo-100">
                        <p className="text-xs text-gray-500 mb-1">Lecturer Feedback</p>
                        <p className="text-sm text-gray-700 italic">"{submission.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submitted but not graded */}
                {submission && !graded && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-700 font-medium">
                      Awaiting grade from lecturer
                    </p>
                    {submission.content && (
                      <p className="text-sm text-gray-600 mt-1">{submission.content}</p>
                    )}
                    {submission.file_path && (
                      <p className="text-xs text-gray-400 mt-1">📎 File submitted</p>
                    )}
                  </div>
                )}

                {/* Submission Form — only if not submitted */}
                {!submission && (
                  <form onSubmit={(e) => handleSubmit(e, assignment.id)}
                    className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    <textarea
                      value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      placeholder="Write your answer here..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 transition">
                        📎 {form.file ? form.file.name : 'Attach File'}
                        <input type="file"
                          onChange={e => setForm({ ...form, file: e.target.files[0] })}
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                          className="hidden" />
                      </label>
                      {form.file && (
                        <button type="button"
                          onClick={() => setForm({ ...form, file: null })}
                          className="text-xs text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      )}
                    </div>
                    <button type="submit"
                      disabled={submitting === assignment.id || (!form.content && !form.file)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
                      {submitting === assignment.id ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
