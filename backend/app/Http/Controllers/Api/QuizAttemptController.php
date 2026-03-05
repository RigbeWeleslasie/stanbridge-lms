<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    // POST /api/quizzes/{quiz}/attempt - start attempt
    public function start(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can take quizzes'], 403);
        }

        if (!$quiz->is_published) {
            return response()->json(['message' => 'Quiz is not available'], 403);
        }

        $attemptsCount = QuizAttempt::where('quiz_id', $quiz->id)
                                     ->where('user_id', $user->id)
                                     ->count();

        if ($attemptsCount >= $quiz->attempts_allowed) {
            return response()->json(['message' => 'No attempts remaining'], 403);
        }

        $attempt = QuizAttempt::create([
            'quiz_id'    => $quiz->id,
            'user_id'    => $user->id,
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);

        // return quiz with questions (without correct answers)
        $questions = $quiz->questions->map->hideAnswer();

        return response()->json([
            'attempt'   => $attempt,
            'quiz'      => $quiz,
            'questions' => $questions,
        ], 201);
    }

    // POST /api/attempts/{attempt}/submit - submit answers
    public function submit(Request $request, QuizAttempt $attempt)
    {
        $user = $request->user();

        if ($attempt->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($attempt->status === 'completed') {
            return response()->json(['message' => 'Attempt already submitted'], 409);
        }

        $request->validate([
            'answers' => 'required|array',
        ]);

        // auto grade
        $quiz      = $attempt->quiz;
        $questions = $quiz->questions;
        $answers   = $request->answers; // e.g. {"1": "a", "2": "c"}
        $score     = 0;

        foreach ($questions as $question) {
            $studentAnswer = $answers[(string) $question->id] ?? null;
            if ($studentAnswer === $question->correct_answer) {
                $score += $question->marks;
            }
        }

        $attempt->update([
            'answers'      => $answers,
            'score'        => $score,
            'total_marks'  => $quiz->total_marks,
            'status'       => 'completed',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message'     => 'Quiz submitted successfully',
            'score'       => $score,
            'total_marks' => $quiz->total_marks,
            'percentage'  => $quiz->total_marks > 0
                                ? round(($score / $quiz->total_marks) * 100, 1)
                                : 0,
            'attempt'     => $attempt,
        ]);
    }

    // GET /api/quizzes/{quiz}/my-attempt
    public function myAttempt(Request $request, Quiz $quiz)
    {
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
                               ->where('user_id', $request->user()->id)
                               ->latest()
                               ->first();

        return response()->json($attempt);
    }
}
