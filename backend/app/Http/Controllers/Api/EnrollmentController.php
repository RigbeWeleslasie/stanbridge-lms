<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // POST /api/courses/{course}/enroll - student enrolls themselves
    public function enroll(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can enroll'], 403);
        }

        $already = Enrollment::where('user_id', $user->id)
                              ->where('course_id', $course->id)
                              ->exists();

        if ($already) {
            return response()->json(['message' => 'Already enrolled in this course'], 409);
        }

        $enrollment = Enrollment::create([
            'user_id'   => $user->id,
            'course_id' => $course->id,
            'status'    => 'active',
        ]);

        return response()->json([
            'message'    => 'Enrolled successfully',
            'enrollment' => $enrollment->load('course'),
        ], 201);
    }

    // DELETE /api/courses/{course}/enroll - student drops course
    public function drop(Request $request, Course $course)
    {
        $user = $request->user();

        $enrollment = Enrollment::where('user_id', $user->id)
                                 ->where('course_id', $course->id)
                                 ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Not enrolled in this course'], 404);
        }

        $enrollment->update(['status' => 'dropped']);

        return response()->json(['message' => 'Course dropped successfully']);
    }

    // GET /api/my-courses - student sees their enrolled courses
    public function myCourses(Request $request)
    {
        $user = $request->user();

        $enrollments = Enrollment::where('user_id', $user->id)
                                  ->where('status', 'active')
                                  ->with('course.lecturer:id,name,email')
                                  ->get();

        return response()->json($enrollments);
    }

    // GET /api/courses/{course}/students - lecturer sees enrolled students
    public function courseStudents(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->lecturer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $students = Enrollment::where('course_id', $course->id)
                               ->where('status', 'active')
                               ->with('student:id,name,email')
                               ->get();

        return response()->json($students);
    }
}
