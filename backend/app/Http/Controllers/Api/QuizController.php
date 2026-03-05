<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    // GET /api/courses/{course}/quizzes
    public function index(Request $request, Course $course)
    {
        $user   = $request->user();
        $quizzes = Quiz::where('course_id', $course->id)
                       ->withCount('questions')
                       ->when($user->role === 'student', fn($q) => $q->where('is_published', true))
                       ->get();

        return response()->json($quizzes);
    }

    // POST /api/courses/{course}/quizzes
    public function store(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'time_limit'       => 'sometimes|integer|min:1',
            'attempts_allowed' => 'sometimes|integer|min:1',
            'is_published'     => 'sometimes|boolean',
        ]);

        $quiz = Quiz::create([
            'course_id'        => $course->id,
            'title'            => $request->title,
            'description'      => $request->description,
            'time_limit'       => $request->time_limit ?? 30,
            'attempts_allowed' => $request->attempts_allowed ?? 1,
            'is_published'     => $request->is_published ?? false,
            'total_marks'      => 0,
        ]);

        return response()->json($quiz, 201);
    }

    // GET /api/quizzes/{quiz}
    public function show(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            // hide correct answers from students
            $questions = $quiz->questions->map->hideAnswer();
            return response()->json($quiz->load('course:id,title')->setAttribute('questions', $questions));
        }

        return response()->json($quiz->load(['questions', 'course:id,title']));
    }

    // PUT /api/quizzes/{quiz}/publish
    public function publish(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $quiz->course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz->update(['is_published' => !$quiz->is_published]);

        return response()->json([
            'message'      => $quiz->is_published ? 'Quiz published' : 'Quiz unpublished',
            'is_published' => $quiz->is_published,
        ]);
    }

    // DELETE /api/quizzes/{quiz}
    public function destroy(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $quiz->course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted']);
    }

    // GET /api/quizzes/{quiz}/results
    public function results(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $quiz->course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attempts = $quiz->attempts()
                         ->with('student:id,name,email')
                         ->where('status', 'completed')
                         ->get();

        return response()->json($attempts);
    }
}
