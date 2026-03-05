<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    // POST /api/quizzes/{quiz}/questions
    public function store(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $quiz->course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'question_text'  => 'required|string',
            'option_a'       => 'required|string',
            'option_b'       => 'required|string',
            'option_c'       => 'required|string',
            'option_d'       => 'required|string',
            'correct_answer' => 'required|in:a,b,c,d',
            'marks'          => 'sometimes|integer|min:1',
        ]);

        $question = Question::create([
            'quiz_id'        => $quiz->id,
            'question_text'  => $request->question_text,
            'option_a'       => $request->option_a,
            'option_b'       => $request->option_b,
            'option_c'       => $request->option_c,
            'option_d'       => $request->option_d,
            'correct_answer' => $request->correct_answer,
            'marks'          => $request->marks ?? 1,
        ]);

        // update total marks on quiz
        $quiz->update([
            'total_marks' => $quiz->questions()->sum('marks'),
        ]);

        return response()->json($question, 201);
    }

    // DELETE /api/questions/{question}
    public function destroy(Request $request, Question $question)
    {
        $user = $request->user();
        $quiz = $question->quiz;

        if ($user->role !== 'admin' && $quiz->course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();

        // update total marks
        $quiz->update([
            'total_marks' => $quiz->questions()->sum('marks'),
        ]);

        return response()->json(['message' => 'Question deleted']);
    }
}
