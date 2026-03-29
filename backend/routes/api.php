<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizAttemptController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\AdminEnrollmentController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // IMPORTANT: specific routes BEFORE parameterized routes
    Route::get('/courses/available', [EnrollmentController::class, 'available']);

    // Courses
    Route::get('/courses',             [CourseController::class, 'index']);
    Route::post('/courses',            [CourseController::class, 'store']);
    Route::get('/courses/{course}',    [CourseController::class, 'show']);
    Route::put('/courses/{course}',    [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

    // Enrollment
    Route::get('/my-courses',                [EnrollmentController::class, 'myCourses']);
    Route::get('/my-enrollments',            [EnrollmentController::class, 'myEnrollments']);
    Route::post('/courses/{course}/request', [EnrollmentController::class, 'requestEnrollment']);
    Route::get('/courses/{course}/students', [EnrollmentController::class, 'courseStudents']);

    // Assignments
    Route::get('/courses/{course}/assignments',                 [AssignmentController::class, 'index']);
    Route::post('/courses/{course}/assignments',                [AssignmentController::class, 'store']);
    Route::get('/courses/{course}/assignments/{assignment}',    [AssignmentController::class, 'show']);
    Route::put('/courses/{course}/assignments/{assignment}',    [AssignmentController::class, 'update']);
    Route::delete('/courses/{course}/assignments/{assignment}', [AssignmentController::class, 'destroy']);

    // Submissions
    Route::post('/assignments/{assignment}/submit',       [SubmissionController::class, 'store']);
    Route::get('/assignments/{assignment}/submissions',   [SubmissionController::class, 'index']);
    Route::get('/assignments/{assignment}/my-submission', [SubmissionController::class, 'mySubmission']);
    Route::put('/submissions/{submission}/grade',         [SubmissionController::class, 'grade']);

    // Quizzes
    Route::get('/courses/{course}/quizzes',  [QuizController::class, 'index']);
    Route::post('/courses/{course}/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}',            [QuizController::class, 'show']);
    Route::put('/quizzes/{quiz}/publish',    [QuizController::class, 'publish']);
    Route::delete('/quizzes/{quiz}',         [QuizController::class, 'destroy']);
    Route::get('/quizzes/{quiz}/results',    [QuizController::class, 'results']);

    // Questions
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
    Route::delete('/questions/{question}',   [QuestionController::class, 'destroy']);

    // Quiz Attempts
    Route::post('/quizzes/{quiz}/attempt',    [QuizAttemptController::class, 'start']);
    Route::post('/attempts/{attempt}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/quizzes/{quiz}/my-attempt',  [QuizAttemptController::class, 'myAttempt']);

    // Semesters
    Route::get('/semesters',               [SemesterController::class, 'index']);
    Route::post('/semesters',              [SemesterController::class, 'store']);
    Route::put('/semesters/{semester}',    [SemesterController::class, 'update']);
    Route::delete('/semesters/{semester}', [SemesterController::class, 'destroy']);

    // Modules
    Route::get('/courses/{course}/modules',  [ModuleController::class, 'index']);
    Route::post('/courses/{course}/modules', [ModuleController::class, 'store']);
    Route::put('/modules/{module}',          [ModuleController::class, 'update']);
    Route::delete('/modules/{module}',       [ModuleController::class, 'destroy']);

    // Lessons
    Route::post('/modules/{module}/lessons',  [LessonController::class, 'store']);
    Route::get('/lessons/{lesson}',           [LessonController::class, 'show']);
    Route::put('/lessons/{lesson}',           [LessonController::class, 'update']);
    Route::delete('/lessons/{lesson}',        [LessonController::class, 'destroy']);
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'markComplete']);
    Route::get('/courses/{course}/progress',  [LessonController::class, 'courseProgress']);

    // Admin
    Route::prefix('admin')->group(function () {
        Route::get('/students',                         [AdminEnrollmentController::class, 'students']);
        Route::get('/enrollments',                      [AdminEnrollmentController::class, 'index']);
        Route::get('/enrollments/pending',              [AdminEnrollmentController::class, 'pending']);
        Route::put('/enrollments/{enrollment}/approve', [AdminEnrollmentController::class, 'approve']);
        Route::put('/enrollments/{enrollment}/reject',  [AdminEnrollmentController::class, 'reject']);
        Route::post('/enroll',                          [AdminEnrollmentController::class, 'enroll']);
        Route::post('/enroll/bulk',                     [AdminEnrollmentController::class, 'bulkEnroll']);
        Route::delete('/enroll',                        [AdminEnrollmentController::class, 'unenroll']);
        Route::get('/users',                            [UserController::class, 'index']);
    });
});
