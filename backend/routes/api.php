<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('courses', CourseController::class);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/courses/{course}/enroll',    [EnrollmentController::class, 'enroll']);
    Route::delete('/courses/{course}/enroll',  [EnrollmentController::class, 'drop']);
    Route::get('/my-courses',                  [EnrollmentController::class, 'myCourses']);
    Route::get('/courses/{course}/students',   [EnrollmentController::class, 'courseStudents']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/courses/{course}/assignments',                     [AssignmentController::class, 'index']);
    Route::post('/courses/{course}/assignments',                    [AssignmentController::class, 'store']);
    Route::get('/courses/{course}/assignments/{assignment}',        [AssignmentController::class, 'show']);
    Route::put('/courses/{course}/assignments/{assignment}',        [AssignmentController::class, 'update']);
    Route::delete('/courses/{course}/assignments/{assignment}',     [AssignmentController::class, 'destroy']);

    Route::post('/assignments/{assignment}/submit',                 [SubmissionController::class, 'store']);
    Route::get('/assignments/{assignment}/submissions',             [SubmissionController::class, 'index']);
    Route::get('/assignments/{assignment}/my-submission',           [SubmissionController::class, 'mySubmission']);
    Route::put('/submissions/{submission}/grade',                   [SubmissionController::class, 'grade']);
});
