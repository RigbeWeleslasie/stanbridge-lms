export default function QuizResult({ result, quiz, onBack }) {
  const percentage = result.percentage;
  const passed     = percentage >= 50;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">{percentage === 100 ? '' : passed ? '' : ''}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{quiz.title}</h2>
        <p className="text-gray-500 mb-6">Quiz Completed!</p>

        {/* Score Circle */}
        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-6 ${
          passed ? 'bg-green-50 border-4 border-green-400' : 'bg-red-50 border-4 border-red-400'
        }`}>
          <p className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {percentage}%
          </p>
          <p className="text-xs text-gray-500">{result.score}/{result.total_marks}</p>
        </div>

        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${
          passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {passed ? 'Passed' : 'Failed'}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xl font-bold text-indigo-600">{result.score}</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xl font-bold text-gray-700">{result.total_marks}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xl font-bold text-yellow-500">{percentage}%</p>
            <p className="text-xs text-gray-500">Percent</p>
          </div>
        </div>

        <button onClick={onBack}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition">
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}
