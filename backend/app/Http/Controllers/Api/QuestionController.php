<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    private function canManage($user, $quiz)
    {
        return $user->role === 'admin' || $quiz->course->lecturer_id === $user->id;
    }

    public function store(Request $request, Quiz $quiz)
    {
        if (!$this->canManage($request->user(), $quiz)) {
            return response()->json(['message' => 'Unauthorized — you do not own this quiz'], 403);
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

        $quiz->update(['total_marks' => $quiz->questions()->sum('marks')]);

        return response()->json($question, 201);
    }

    public function destroy(Request $request, Question $question)
    {
        $quiz = $question->quiz;

        if (!($request->user()->role === 'admin' || $quiz->course->lecturer_id === $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();
        $quiz->update(['total_marks' => $quiz->questions()->sum('marks')]);

        return response()->json(['message' => 'Question deleted']);
    }
}
