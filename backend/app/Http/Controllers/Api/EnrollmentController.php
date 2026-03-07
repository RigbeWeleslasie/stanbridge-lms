<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // GET /api/my-courses
    public function myCourses(Request $request)
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
                                  ->where('status', 'active')
                                  ->with([
                                      'course.lecturer:id,name,email',
                                      'course.semester:id,name',
                                      'course.assignments',
                                  ])
                                  ->get();

        return response()->json($enrollments);
    }

    // GET /api/my-enrollments — all including pending/rejected
    public function myEnrollments(Request $request)
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
                                  ->with([
                                      'course.lecturer:id,name,email',
                                      'course.semester:id,name',
                                  ])
                                  ->get();

        return response()->json($enrollments);
    }

    // GET /api/courses/available — courses student can request
    public function available(Request $request)
    {
        // get active semester
        $semester = Semester::where('is_active', true)->first();

        $enrollmentOpen = false;
        $enrollmentEnd  = null;
        $semesterInfo   = null;

        if ($semester) {
            $enrollmentOpen = $semester->enrollment_open;
            $enrollmentEnd  = $semester->enrollment_end;
            $semesterInfo   = $semester;
        }

        // get all active courses
        $courses = Course::with(['lecturer:id,name,email', 'semester:id,name'])
                         ->where('status', 'active')
                         ->get();

        // get student's existing enrollments
        $myEnrollments = Enrollment::where('user_id', $request->user()->id)
                                    ->get()
                                    ->keyBy('course_id');

        $courses = $courses->map(function ($course) use ($myEnrollments) {
            $enrollment = $myEnrollments->get($course->id);
            $course->enrollment_status = $enrollment ? $enrollment->status : null;
            $course->enrollment_id     = $enrollment ? $enrollment->id : null;
            return $course;
        });

        return response()->json([
            'courses'         => $courses,
            'enrollment_open' => $enrollmentOpen,
            'enrollment_end'  => $enrollmentEnd,
            'semester'        => $semesterInfo,
        ]);
    }

    // POST /api/courses/{course}/request — student requests enrollment
    public function requestEnrollment(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can request enrollment'], 403);
        }

        // check enrollment period
        $semester = Semester::where('is_active', true)->first();

        if (!$semester) {
            return response()->json([
                'message' => 'No active semester. Enrollment is not open.',
            ], 403);
        }

        if (!$semester->enrollment_open) {
            $msg = Carbon::now()->lt($semester->enrollment_start)
                ? 'Enrollment has not opened yet. Opens on ' . $semester->enrollment_start->format('M d, Y')
                : 'Enrollment deadline has passed. Deadline was ' . $semester->enrollment_end->format('M d, Y');

            return response()->json(['message' => $msg], 403);
        }

        // check already enrolled/requested
        $existing = Enrollment::where('user_id', $user->id)
                               ->where('course_id', $course->id)
                               ->first();

        if ($existing) {
            $messages = [
                'pending'  => 'You already requested enrollment in this course. Waiting for admin approval.',
                'active'   => 'You are already enrolled in this course.',
                'rejected' => 'Your enrollment request was rejected by admin.',
            ];
            return response()->json([
                'message' => $messages[$existing->status],
                'status'  => $existing->status,
            ], 409);
        }

        $enrollment = Enrollment::create([
            'user_id'     => $user->id,
            'course_id'   => $course->id,
            'status'      => 'pending',
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message'    => 'Enrollment request submitted! Waiting for admin approval.',
            'enrollment' => $enrollment,
        ], 201);
    }

    // GET /api/courses/{course}/students
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
