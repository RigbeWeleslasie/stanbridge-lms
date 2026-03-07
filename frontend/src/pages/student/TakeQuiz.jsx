import { useState, useEffect, useCallback } from 'react';

export default function TakeQuiz({ attempt, quiz, questions, onSubmit, onCancel }) {
  const [answers, setAnswers]       = useState({});
  const [current, setCurrent]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(quiz.time_limit * 60);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    await onSubmit(attempt.id, answers);
  }, [submitting, attempt.id, answers, onSubmit]);

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const question   = questions[current];
  const isAnswered = (id) => answers[id] !== undefined;
  const progress   = Math.round((Object.keys(answers).length / questions.length) * 100);
  const isLast     = current === questions.length - 1;
  const timerColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 180 ? 'text-yellow-500' : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center border border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-sm text-gray-500">{questions.length} questions · {quiz.total_marks} marks</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold font-mono ${timerColor}`}>{formatTime(timeLeft)}</p>
            <p className="text-xs text-gray-400">remaining</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>

          {/* Question dots */}
          <div className="flex flex-wrap gap-2 mt-3">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition ${
                  current === i
                    ? 'bg-indigo-600 text-white'
                    : isAnswered(q.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-gray-400">Question {current + 1} of {questions.length}</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{question.question_text}</h3>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map(opt => (
              <button key={opt}
                onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition font-medium ${
                  answers[question.id] === opt
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-3 ${
                  answers[question.id] === opt
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {opt.toUpperCase()}
                </span>
                {question[`option_${opt}`]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700">
            ← Exit Quiz
          </button>
          <div className="flex gap-3">
            {current > 0 && (
              <button onClick={() => setCurrent(current - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                Previous
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setCurrent(current + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 font-semibold">
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
