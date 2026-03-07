<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;

class AdminEnrollmentController extends Controller
{
    private function adminOnly(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json(['message' => 'Admin only'], 403));
        }
    }

    // GET /api/admin/enrollments — all enrollments
    public function index(Request $request)
    {
        $this->adminOnly($request);

        $enrollments = Enrollment::with([
            'student:id,name,email',
            'course:id,title,code,lecturer_id',
            'course.lecturer:id,name',
        ])->orderBy('created_at', 'desc')->get();

        return response()->json($enrollments);
    }

    // GET /api/admin/enrollments/pending
    public function pending(Request $request)
    {
        $this->adminOnly($request);

        $enrollments = Enrollment::where('status', 'pending')
                                  ->with([
                                      'student:id,name,email',
                                      'course:id,title,code,lecturer_id',
                                      'course.lecturer:id,name',
                                  ])
                                  ->orderBy('created_at', 'desc')
                                  ->get();

        return response()->json($enrollments);
    }

    // PUT /api/admin/enrollments/{enrollment}/approve
    public function approve(Request $request, Enrollment $enrollment)
    {
        $this->adminOnly($request);

        $enrollment->update([
            'status'      => 'active',
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message'    => 'Enrollment approved!',
            'enrollment' => $enrollment->load([
                'student:id,name,email',
                'course:id,title,code',
            ]),
        ]);
    }

    // PUT /api/admin/enrollments/{enrollment}/reject
    public function reject(Request $request, Enrollment $enrollment)
    {
        $this->adminOnly($request);

        $enrollment->update(['status' => 'rejected']);

        return response()->json([
            'message'    => 'Enrollment rejected.',
            'enrollment' => $enrollment,
        ]);
    }

    // POST /api/admin/enroll — manual enrollment by admin
    public function enroll(Request $request)
    {
        $this->adminOnly($request);

        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $user = User::find($request->user_id);
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can be enrolled'], 422);
        }

        $existing = Enrollment::where('user_id', $request->user_id)
                               ->where('course_id', $request->course_id)
                               ->first();

        if ($existing) {
            // upgrade to active if pending/rejected
            $existing->update(['status' => 'active', 'enrolled_at' => now()]);
            return response()->json([
                'message'    => 'Student enrollment activated!',
                'enrollment' => $existing->load(['student:id,name,email', 'course:id,title,code']),
            ]);
        }

        $enrollment = Enrollment::create([
            'user_id'     => $request->user_id,
            'course_id'   => $request->course_id,
            'status'      => 'active',
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message'    => 'Student enrolled successfully!',
            'enrollment' => $enrollment->load([
                'student:id,name,email',
                'course:id,title,code',
            ]),
        ], 201);
    }

    // POST /api/admin/enroll/bulk
    public function bulkEnroll(Request $request)
    {
        $this->adminOnly($request);

        $request->validate([
            'user_ids'   => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'course_id'  => 'required|exists:courses,id',
        ]);

        $enrolled = 0;
        $skipped  = 0;

        foreach ($request->user_ids as $userId) {
            $existing = Enrollment::where('user_id', $userId)
                                   ->where('course_id', $request->course_id)
                                   ->first();
            if ($existing) {
                $existing->update(['status' => 'active', 'enrolled_at' => now()]);
                $skipped++;
                continue;
            }

            Enrollment::create([
                'user_id'     => $userId,
                'course_id'   => $request->course_id,
                'status'      => 'active',
                'enrolled_at' => now(),
            ]);
            $enrolled++;
        }

        return response()->json([
            'message'  => "Enrolled {$enrolled} students. Updated {$skipped} existing.",
            'enrolled' => $enrolled,
            'skipped'  => $skipped,
        ]);
    }

    // DELETE /api/admin/enroll
    public function unenroll(Request $request)
    {
        $this->adminOnly($request);

        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $enrollment = Enrollment::where('user_id', $request->user_id)
                                 ->where('course_id', $request->course_id)
                                 ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $enrollment->delete();
        return response()->json(['message' => 'Student unenrolled successfully']);
    }

    // GET /api/admin/students
    public function students(Request $request)
    {
        $this->adminOnly($request);

        $students = User::where('role', 'student')
                        ->with(['enrollments.course:id,title,code'])
                        ->get();

        return response()->json($students);
    }
}
