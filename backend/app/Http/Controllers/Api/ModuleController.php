<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    private function canManage($user, $course)
    {
        return $user->role === 'admin' ||
               $course->lecturer_id === $user->id;
    }

    // GET /api/courses/{course}/modules
    public function index(Request $request, Course $course)
    {
        $user = $request->user();

        $modules = Module::where('course_id', $course->id)
            ->when($user->role === 'student', fn($q) =>
                $q->where('is_published', true)
            )
            ->withCount('lessons')
            ->with(['lessons' => function($q) use ($user) {
                if ($user->role === 'student') {
                    $q->where('is_published', true);
                }
                $q->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // attach progress for students
        if ($user->role === 'student') {
            $completedLessons = \App\Models\LessonProgress::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('completed', true)
                ->pluck('lesson_id')
                ->toArray();

            $modules = $modules->map(function ($module) use ($completedLessons) {
                $module->lessons = $module->lessons->map(function ($lesson) use ($completedLessons) {
                    $lesson->completed = in_array($lesson->id, $completedLessons);
                    return $lesson;
                });
                $module->completed_count = $module->lessons->where('completed', true)->count();
                return $module;
            });
        }

        return response()->json($modules);
    }

    // POST /api/courses/{course}/modules
    public function store(Request $request, Course $course)
    {
        if (!$this->canManage($request->user(), $course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'order'        => 'sometimes|integer',
            'is_published' => 'sometimes|boolean',
        ]);

        $order = $request->order ??
            Module::where('course_id', $course->id)->max('order') + 1;

        $module = Module::create([
            'course_id'    => $course->id,
            'title'        => $request->title,
            'description'  => $request->description,
            'order'        => $order,
            'is_published' => $request->is_published ?? false,
        ]);

        return response()->json($module, 201);
    }

    // PUT /api/modules/{module}
    public function update(Request $request, Module $module)
    {
        if (!$this->canManage($request->user(), $module->course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'order'        => 'sometimes|integer',
            'is_published' => 'sometimes|boolean',
        ]);

        $module->update($request->only([
            'title', 'description', 'order', 'is_published',
        ]));

        return response()->json($module);
    }

    // DELETE /api/modules/{module}
    public function destroy(Request $request, Module $module)
    {
        if (!$this->canManage($request->user(), $module->course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module->delete();
        return response()->json(['message' => 'Module deleted']);
    }
}
