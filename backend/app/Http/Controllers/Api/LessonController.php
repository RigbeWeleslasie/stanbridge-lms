<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    private function canManage($user, $module)
    {
        return $user->role === 'admin' ||
               $module->course->lecturer_id === $user->id;
    }

    // POST /api/modules/{module}/lessons
    public function store(Request $request, Module $module)
    {
        if (!$this->canManage($request->user(), $module)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'            => 'required|string|max:255',
            'type'             => 'required|in:text,video,file,link',
            'content'          => 'nullable|string',
            'video_url'        => 'nullable|string',
            'external_url'     => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'order'            => 'sometimes|integer',
            'is_published'     => 'sometimes|boolean',
            'file'             => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:20480',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store(
                'lessons/' . $module->course_id, 'public'
            );
        }

        $order = $request->order ??
            Lesson::where('module_id', $module->id)->max('order') + 1;

        $lesson = Lesson::create([
            'module_id'        => $module->id,
            'title'            => $request->title,
            'type'             => $request->type,
            'content'          => $request->content,
            'video_url'        => $request->video_url,
            'external_url'     => $request->external_url,
            'file_path'        => $filePath,
            'duration_minutes' => $request->duration_minutes,
            'order'            => $order,
            'is_published'     => $request->is_published ?? false,
        ]);

        $lesson->file_url = $lesson->file_url;

        return response()->json($lesson, 201);
    }

    // GET /api/lessons/{lesson}
    public function show(Request $request, Lesson $lesson)
    {
        $user   = $request->user();
        $module = $lesson->module;
        $course = $module->course;

        // check student is enrolled
        if ($user->role === 'student') {
            $enrolled = \App\Models\Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->exists();

            if (!$enrolled) {
                return response()->json(['message' => 'Not enrolled in this course'], 403);
            }
        }

        $lesson->file_url = $lesson->file_url;

        // get progress
        $progress = LessonProgress::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        $lesson->completed = $progress?->completed ?? false;

        return response()->json($lesson);
    }

    // PUT /api/lessons/{lesson}
    public function update(Request $request, Lesson $lesson)
    {
        if (!$this->canManage($request->user(), $lesson->module)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'            => 'sometimes|string|max:255',
            'content'          => 'nullable|string',
            'video_url'        => 'nullable|string',
            'external_url'     => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'order'            => 'sometimes|integer',
            'is_published'     => 'sometimes|boolean',
        ]);

        $lesson->update($request->only([
            'title', 'content', 'video_url',
            'external_url', 'duration_minutes',
            'order', 'is_published',
        ]));

        return response()->json($lesson);
    }

    // DELETE /api/lessons/{lesson}
    public function destroy(Request $request, Lesson $lesson)
    {
        if (!$this->canManage($request->user(), $lesson->module)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($lesson->file_path) {
            Storage::disk('public')->delete($lesson->file_path);
        }

        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }

    // POST /api/lessons/{lesson}/complete
    public function markComplete(Request $request, Lesson $lesson)
    {
        $user = $request->user();

        LessonProgress::updateOrCreate(
            [
                'user_id'   => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'course_id'    => $lesson->module->course_id,
                'completed'    => true,
                'completed_at' => now(),
            ]
        );

        // calculate course progress
        $course        = $lesson->module->course;
        $totalLessons  = Lesson::whereHas('module', fn($q) =>
            $q->where('course_id', $course->id)
              ->where('is_published', true)
        )->where('is_published', true)->count();

        $completedCount = LessonProgress::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('completed', true)
            ->count();

        $percentage = $totalLessons > 0
            ? round(($completedCount / $totalLessons) * 100)
            : 0;

        return response()->json([
            'message'    => 'Lesson marked as complete!',
            'progress'   => $percentage,
            'completed'  => $completedCount,
            'total'      => $totalLessons,
        ]);
    }

    // GET /api/courses/{course}/progress
    public function courseProgress(Request $request, \App\Models\Course $course)
    {
        $user = $request->user();

        $totalLessons = Lesson::whereHas('module', fn($q) =>
            $q->where('course_id', $course->id)
              ->where('is_published', true)
        )->where('is_published', true)->count();

        $completedCount = LessonProgress::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('completed', true)
            ->count();

        $percentage = $totalLessons > 0
            ? round(($completedCount / $totalLessons) * 100)
            : 0;

        return response()->json([
            'total'      => $totalLessons,
            'completed'  => $completedCount,
            'percentage' => $percentage,
        ]);
    }
}
