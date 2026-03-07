import { useState } from 'react';

export default function SubmissionsTab({ submissions, onGrade }) {
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [filter, setFilter]       = useState('pending');
  const [message, setMessage]     = useState('');

  const filtered = submissions.filter(s =>
    filter === 'all'     ? true :
    filter === 'pending' ? s.status !== 'graded' :
    s.status === 'graded'
  );

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      await onGrade(gradingId, parseInt(gradeForm.grade), gradeForm.feedback);
      setGradingId(null);
      setGradeForm({ grade: '', feedback: '' });
      setMessage('Graded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submissions</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        {['pending', 'graded', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f}
            {f === 'pending' && (
              <span className="ml-1 text-xs">
                ({submissions.filter(s => s.status !== 'graded').length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No {filter} submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(sub => (
            <div key={sub.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{sub.student?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sub.status === 'graded'    ? 'bg-green-100 text-green-700' :
                      sub.status === 'late'      ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>{sub.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {sub.assignment?.title} · {sub.course?.title}
                  </p>

                  {/* Submission content */}
                  {sub.content && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {sub.content}
                    </div>
                  )}

                  {/* File attachment */}
                  {sub.file_url && (
                    <a href={`http://localhost:8000${sub.file_url}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:underline">
                      📎 Download Attachment
                    </a>
                  )}

                  {/* Feedback */}
                  {sub.status === 'graded' && sub.feedback && (
                    <p className="text-xs text-gray-500 italic mt-2">💬 {sub.feedback}</p>
                  )}
                </div>

                {/* Grade display */}
                <div className="text-right ml-4">
                  {sub.status === 'graded' && (
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{sub.grade}</p>
                      <p className="text-xs text-gray-400">/{sub.assignment?.total_marks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Grading form */}
              {sub.status !== 'graded' && (
                <>
                  {gradingId === sub.id ? (
                    <form onSubmit={handleGrade} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Grade (0 - {sub.assignment?.total_marks})
                          </label>
                          <input type="number"
                            value={gradeForm.grade}
                            onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}
                            max={sub.assignment?.total_marks} min={0} required
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Feedback</label>
                          <input
                            value={gradeForm.feedback}
                            onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                            placeholder="Optional feedback"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit"
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700">
                          Submit Grade
                        </button>
                        <button type="button" onClick={() => setGradingId(null)}
                          className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setGradingId(sub.id)}
                      className="mt-2 text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700">
                      Grade
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
