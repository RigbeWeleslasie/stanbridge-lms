<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // GET /api/courses - everyone can view
    public function index()
    {
        $courses = Course::with('lecturer:id,name,email')->get();
        return response()->json($courses);
    }

    // GET /api/courses/{id}
    public function show(Course $course)
    {
        return response()->json($course->load('lecturer:id,name,email'));
    }

    // POST /api/courses - lecturer or admin only
    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'lecturer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'code'        => 'required|string|unique:courses',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $course = Course::create([
            'title'       => $request->title,
            'description' => $request->description,
            'code'        => $request->code,
            'status'      => $request->status ?? 'active',
            'lecturer_id' => $request->user()->id,
        ]);

        return response()->json($course->load('lecturer:id,name,email'), 201);
    }

    // PUT /api/courses/{id}
    public function update(Request $request, Course $course)
    {
        if ($request->user()->role !== 'admin' && $course->lecturer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'code'        => 'sometimes|string|unique:courses,code,' . $course->id,
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $course->update($request->only(['title', 'description', 'code', 'status']));

        return response()->json($course->load('lecturer:id,name,email'));
    }

    // DELETE /api/courses/{id}
    public function destroy(Request $request, Course $course)
    {
        if ($request->user()->role !== 'admin' && $course->lecturer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
