import { useState, useEffect } from 'react';
import useQuiz    from '../../hooks/useQuiz';
import TakeQuiz   from './TakeQuiz';
import QuizResult from './QuizResult';

export default function QuizzesTab({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.course_id || null);
  const [activeQuiz, setActiveQuiz]         = useState(null);
  const [result, setResult]                 = useState(null);
  const [attempts, setAttempts]             = useState({});
  const [message, setMessage]               = useState('');

  const { quizzes, loading, startAttempt, submitAttempt, getMyAttempt } = useQuiz(selectedCourse);

  useEffect(() => {
    if (quizzes.length > 0) fetchAttempts();
  }, [quizzes]);

  const fetchAttempts = async () => {
    const results = {};
    await Promise.all(quizzes.map(async (quiz) => {
      const attempt = await getMyAttempt(quiz.id);
      if (attempt) results[quiz.id] = attempt;
    }));
    setAttempts(results);
  };

  const handleStart = async (quiz) => {
    try {
      const data = await startAttempt(quiz.id);
      setActiveQuiz({ ...data, quizData: quiz });
      setResult(null);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = async (attemptId, answers) => {
    try {
      const data = await submitAttempt(attemptId, answers);
      setResult({ ...data, quiz: activeQuiz.quizData });
      setActiveQuiz(null);
      fetchAttempts();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (activeQuiz) return (
    <TakeQuiz
      attempt={activeQuiz.attempt}
      quiz={activeQuiz.quiz}
      questions={activeQuiz.questions}
      onSubmit={handleSubmit}
      onCancel={() => setActiveQuiz(null)}
    />
  );

  if (result) return (
    <QuizResult
      result={result}
      quiz={result.quiz}
      onBack={() => setResult(null)}
    />
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quizzes</h2>

      {/* Course selector */}
      {courses.length > 1 && (
        <div className="mb-6">
          <select value={selectedCourse}
            onChange={e => setSelectedCourse(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {courses.map(e => (
              <option key={e.course_id} value={e.course_id}>
                {e.course?.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-600">{message}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No quizzes available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => {
            const attempt = attempts[quiz.id];
            const done    = attempt?.status === 'completed';

            return (
              <div key={quiz.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                      {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>}
                    </div>
                    <p className="text-sm text-gray-500">{quiz.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{quiz.time_limit} mins</span>
                      <span>{quiz.questions_count} questions</span>
                      <span>{quiz.total_marks} marks</span>
                      <span>{quiz.attempts_allowed} attempt(s)</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {done ? (
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {Math.round((attempt.score / attempt.total_marks) * 100)}%
                        </p>
                        <p className="text-xs text-gray-400">{attempt.score}/{attempt.total_marks}</p>
                      </div>
                    ) : (
                      <button onClick={() => handleStart(quiz)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
                        Start Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
