<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    // POST /api/assignments/{assignment}/submit - student submits
    public function store(Request $request, Assignment $assignment)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can submit'], 403);
        }

        $already = Submission::where('assignment_id', $assignment->id)
                              ->where('user_id', $user->id)
                              ->exists();

        if ($already) {
            return response()->json(['message' => 'Already submitted'], 409);
        }

        $request->validate([
            'content' => 'required_without:file|nullable|string',
        ]);

        $isLate = $assignment->due_date && now()->isAfter($assignment->due_date);

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'user_id'       => $user->id,
            'content'       => $request->content,
            'status'        => $isLate ? 'late' : 'submitted',
        ]);

        return response()->json($submission, 201);
    }

    // GET /api/assignments/{assignment}/submissions - lecturer views all submissions
    public function index(Request $request, Assignment $assignment)
    {
        $user = $request->user();
        $course = $assignment->course;

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = Submission::where('assignment_id', $assignment->id)
                                  ->with('student:id,name,email')
                                  ->get();

        return response()->json($submissions);
    }

    // GET /api/assignments/{assignment}/my-submission - student views own submission
    public function mySubmission(Request $request, Assignment $assignment)
    {
        $submission = Submission::where('assignment_id', $assignment->id)
                                 ->where('user_id', $request->user()->id)
                                 ->first();

        if (!$submission) {
            return response()->json(['message' => 'No submission found'], 404);
        }

        return response()->json($submission);
    }

    // PUT /api/submissions/{submission}/grade - lecturer grades submission
    public function grade(Request $request, Submission $submission)
    {
        $user = $request->user();
        $course = $submission->assignment->course;

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'grade'    => 'required|integer|min:0|max:' . $submission->assignment->total_marks,
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'grade'    => $request->grade,
            'feedback' => $request->feedback,
            'status'   => 'graded',
        ]);

        return response()->json($submission);
    }
}
