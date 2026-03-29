<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'semester_id',
        'title',
        'description',
        'code',
        'status',
        'lecturer_id',
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }
}
