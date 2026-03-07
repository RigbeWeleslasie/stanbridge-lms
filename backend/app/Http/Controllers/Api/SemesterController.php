<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    private function adminOnly(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Admin only'], 403);
        }
        return null;
    }

    public function index()
    {
        return response()->json(
            Semester::withCount('courses')
                    ->orderBy('start_date', 'desc')
                    ->get()
        );
    }

    public function store(Request $request)
    {
        if ($err = $this->adminOnly($request)) return $err;

        $request->validate([
            'name'             => 'required|string|max:255',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
            'enrollment_start' => 'nullable|date',
            'enrollment_end'   => 'nullable|date',
            'is_active'        => 'sometimes|boolean',
        ]);

        if ($request->is_active) {
            Semester::where('is_active', true)->update(['is_active' => false]);
        }

        $semester = Semester::create([
            'name'             => $request->name,
            'start_date'       => $request->start_date,
            'end_date'         => $request->end_date,
            'enrollment_start' => $request->enrollment_start,
            'enrollment_end'   => $request->enrollment_end,
            'is_active'        => $request->is_active ?? false,
        ]);

        return response()->json($semester, 201);
    }

    public function update(Request $request, Semester $semester)
    {
        if ($err = $this->adminOnly($request)) return $err;

        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'start_date'       => 'sometimes|date',
            'end_date'         => 'sometimes|date',
            'enrollment_start' => 'nullable|date',
            'enrollment_end'   => 'nullable|date',
            'is_active'        => 'sometimes|boolean',
        ]);

        if ($request->is_active) {
            Semester::where('is_active', true)
                    ->where('id', '!=', $semester->id)
                    ->update(['is_active' => false]);
        }

        $semester->update([
            'name'             => $request->name             ?? $semester->name,
            'start_date'       => $request->start_date       ?? $semester->start_date,
            'end_date'         => $request->end_date         ?? $semester->end_date,
            'enrollment_start' => $request->enrollment_start,
            'enrollment_end'   => $request->enrollment_end,
            'is_active'        => $request->has('is_active') ? $request->is_active : $semester->is_active,
        ]);

        return response()->json($semester->fresh());
    }

    public function destroy(Request $request, Semester $semester)
    {
        if ($err = $this->adminOnly($request)) return $err;
        $semester->delete();
        return response()->json(['message' => 'Semester deleted']);
    }
}
