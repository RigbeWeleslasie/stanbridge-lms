<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    // POST /api/assignments/{assignment}/submit
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
            'content' => 'nullable|string',
            'file'    => 'nullable|file|mimes:pdf,doc,docx,zip,png,jpg,jpeg|max:10240',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store(
                'submissions/' . $user->id, 'public'
            );
        }

        $isLate = $assignment->due_date && now()->isAfter($assignment->due_date);

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'user_id'       => $user->id,
            'content'       => $request->content,
            'file_path'     => $filePath,
            'status'        => $isLate ? 'late' : 'submitted',
        ]);

        return response()->json([
            'message'    => 'Submitted successfully',
            'submission' => $submission,
            'file_url'   => $filePath ? Storage::url($filePath) : null,
        ], 201);
    }

    // GET /api/assignments/{assignment}/submissions
    public function index(Request $request, Assignment $assignment)
    {
        $user   = $request->user();
        $course = $assignment->course;

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = Submission::where('assignment_id', $assignment->id)
                                  ->with('student:id,name,email')
                                  ->get()
                                  ->map(function ($sub) {
                                      $sub->file_url = $sub->file_path
                                          ? Storage::url($sub->file_path)
                                          : null;
                                      return $sub;
                                  });

        return response()->json($submissions);
    }

    // GET /api/assignments/{assignment}/my-submission
    public function mySubmission(Request $request, Assignment $assignment)
    {
        $submission = Submission::where('assignment_id', $assignment->id)
                                 ->where('user_id', $request->user()->id)
                                 ->first();

        if (!$submission) {
            return response()->json(['message' => 'No submission found'], 404);
        }

        $submission->file_url = $submission->file_path
            ? Storage::url($submission->file_path)
            : null;

        return response()->json($submission);
    }

    // PUT /api/submissions/{submission}/grade
    public function grade(Request $request, Submission $submission)
    {
        $user   = $request->user();
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
