<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // Public - no auth needed
    public function public()
    {
        $courses = Course::with(['lecturer:id,name,email', 'semester:id,name'])
                         ->where('status', 'active')
                         ->get();
        return response()->json($courses);
    }

    // GET /api/courses
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'lecturer') {
            $courses = Course::with(['lecturer:id,name,email', 'semester:id,name'])
                             ->where('lecturer_id', $user->id)
                             ->get();
        } else {
            $courses = Course::with(['lecturer:id,name,email', 'semester:id,name'])
                             ->get();
        }

        return response()->json($courses);
    }

    public function show(Course $course)
    {
        return response()->json(
            $course->load(['lecturer:id,name,email', 'semester:id,name'])
        );
    }

    // POST /api/courses - admin only
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can create courses'], 403);
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'code'        => 'required|string|unique:courses',
            'lecturer_id' => 'required|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $course = Course::create([
            'title'       => $request->title,
            'description' => $request->description,
            'code'        => $request->code,
            'lecturer_id' => $request->lecturer_id,
            'semester_id' => $request->semester_id,
            'status'      => $request->status ?? 'active',
        ]);

        return response()->json(
            $course->load(['lecturer:id,name,email', 'semester:id,name']),
            201
        );
    }

    // PUT /api/courses/{course} - admin only
    public function update(Request $request, Course $course)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can update courses'], 403);
        }

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'code'        => 'sometimes|string|unique:courses,code,' . $course->id,
            'lecturer_id' => 'sometimes|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $course->update($request->only([
            'title', 'description', 'code',
            'lecturer_id', 'semester_id', 'status',
        ]));

        return response()->json(
            $course->load(['lecturer:id,name,email', 'semester:id,name'])
        );
    }

    // DELETE /api/courses/{course} - admin only
    public function destroy(Request $request, Course $course)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can delete courses'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }
}
