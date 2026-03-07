import { useState } from 'react';
import useQuizBuilder from '../../hooks/useQuizBuilder';

export default function QuizBuilderTab({ courses }) {
  const [selectedCourse, setSelectedCourse]     = useState(courses[0]?.id || null);
  const [showQuizForm, setShowQuizForm]         = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz]         = useState(null);
  const [results, setResults]                   = useState(null);
  const [message, setMessage]                   = useState('');

  const [quizForm, setQuizForm] = useState({
    title: '', description: '', time_limit: 30, attempts_allowed: 1,
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '', option_a: '', option_b: '',
    option_c: '', option_d: '', correct_answer: 'a', marks: 1,
  });

  const { quizzes, loading, createQuiz, addQuestion, togglePublish, deleteQuiz, getResults } =
    useQuizBuilder(selectedCourse);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await createQuiz(quizForm);
      setShowQuizForm(false);
      setQuizForm({ title: '', description: '', time_limit: 30, attempts_allowed: 1 });
      setMessage('Quiz created!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addQuestion(selectedQuiz, questionForm);
      setQuestionForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', marks: 1 });
      setMessage('Question added!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleViewResults = async (quizId) => {
    try {
      const data = await getResults(quizId);
      setResults({ quizId, data });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quiz Builder</h2>
        <div className="flex gap-3">
          {courses.length > 1 && (
            <select value={selectedCourse}
              onChange={e => setSelectedCourse(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
          <button onClick={() => setShowQuizForm(!showQuizForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
            + New Quiz
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Create Quiz Form */}
      {showQuizForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Create New Quiz</h3>
          <form onSubmit={handleCreateQuiz} className="space-y-3">
            <input value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
              placeholder="Quiz Title" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <textarea value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})}
              placeholder="Description" rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Time Limit (minutes)</label>
                <input type="number" value={quizForm.time_limit}
                  onChange={e => setQuizForm({...quizForm, time_limit: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Attempts Allowed</label>
                <input type="number" value={quizForm.attempts_allowed}
                  onChange={e => setQuizForm({...quizForm, attempts_allowed: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Create</button>
              <button type="button" onClick={() => setShowQuizForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Question Form */}
      {showQuestionForm && selectedQuiz && (
        <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Add Question</h3>
          <form onSubmit={handleAddQuestion} className="space-y-3">
            <textarea value={questionForm.question_text}
              onChange={e => setQuestionForm({...questionForm, question_text: e.target.value})}
              placeholder="Question text" rows={2} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="grid grid-cols-2 gap-3">
              {['a', 'b', 'c', 'd'].map(opt => (
                <input key={opt} value={questionForm[`option_${opt}`]}
                  onChange={e => setQuestionForm({...questionForm, [`option_${opt}`]: e.target.value})}
                  placeholder={`Option ${opt.toUpperCase()}`} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
                <select value={questionForm.correct_answer}
                  onChange={e => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <option key={opt} value={opt}>Option {opt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Marks</label>
                <input type="number" value={questionForm.marks} min={1}
                  onChange={e => setQuestionForm({...questionForm, marks: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Add Question</button>
              <button type="button" onClick={() => setShowQuestionForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">Done</button>
            </div>
          </form>
        </div>
      )}

      {/* Results Modal */}
      {results && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Quiz Results</h3>
            <button onClick={() => setResults(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {results.data.length === 0 ? (
            <p className="text-gray-400 text-sm">No attempts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500">Student</th>
                  <th className="text-left px-3 py-2 text-gray-500">Score</th>
                  <th className="text-left px-3 py-2 text-gray-500">Percentage</th>
                  <th className="text-left px-3 py-2 text-gray-500">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {results.data.map(attempt => (
                  <tr key={attempt.id} className="border-t border-gray-50">
                    <td className="px-3 py-2 font-medium">{attempt.student?.name}</td>
                    <td className="px-3 py-2">{attempt.score}/{attempt.total_marks}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        (attempt.score/attempt.total_marks)*100 >= 50
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {Math.round((attempt.score / attempt.total_marks) * 100)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400">
                      {new Date(attempt.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No quizzes yet. Create your first quiz!
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      quiz.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{quiz.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{quiz.time_limit} mins</span>
                    <span>{quiz.questions_count} questions</span>
                    <span>{quiz.total_marks} marks</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => { setSelectedQuiz(quiz.id); setShowQuestionForm(true); }}
                    className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg">
                    + Question
                  </button>
                  <button onClick={() => handleViewResults(quiz.id)}
                    className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg">
                    Results
                  </button>
                  <button onClick={() => togglePublish(quiz.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg ${
                      quiz.is_published
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                    {quiz.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => deleteQuiz(quiz.id)}
                    className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
