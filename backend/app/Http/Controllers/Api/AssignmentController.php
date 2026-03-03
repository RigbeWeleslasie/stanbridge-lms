<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    // GET /api/courses/{course}/assignments
    public function index(Course $course)
    {
        $assignments = Assignment::where('course_id', $course->id)
                                  ->withCount('submissions')
                                  ->get();
        return response()->json($assignments);
    }

    // GET /api/courses/{course}/assignments/{assignment}
    public function show(Course $course, Assignment $assignment)
    {
        return response()->json($assignment->load('course:id,title,code'));
    }

    // POST /api/courses/{course}/assignments
    public function store(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'total_marks' => 'sometimes|integer|min:1',
        ]);

        $assignment = Assignment::create([
            'course_id'   => $course->id,
            'title'       => $request->title,
            'description' => $request->description,
            'due_date'    => $request->due_date,
            'total_marks' => $request->total_marks ?? 100,
        ]);

        return response()->json($assignment, 201);
    }

    // PUT /api/courses/{course}/assignments/{assignment}
    public function update(Request $request, Course $course, Assignment $assignment)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'total_marks' => 'sometimes|integer|min:1',
        ]);

        $assignment->update($request->only(['title', 'description', 'due_date', 'total_marks']));

        return response()->json($assignment);
    }

    // DELETE /api/courses/{course}/assignments/{assignment}
    public function destroy(Request $request, Course $course, Assignment $assignment)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment->delete();
        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}
