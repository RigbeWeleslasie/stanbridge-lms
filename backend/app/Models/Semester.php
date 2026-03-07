<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'enrollment_start',
        'enrollment_end',
        'is_active',
    ];

    protected $casts = [
        'start_date'       => 'date',
        'end_date'         => 'date',
        'enrollment_start' => 'date',
        'enrollment_end'   => 'date',
        'is_active'        => 'boolean',
    ];

    protected $appends = ['enrollment_open'];

    public function getEnrollmentOpenAttribute()
    {
        if (!$this->enrollment_start || !$this->enrollment_end) return false;
        $now = Carbon::now();
        return $now->between($this->enrollment_start, $this->enrollment_end);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
