<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'content',
        'type',
        'file_path',
        'video_url',
        'external_url',
        'duration_minutes',
        'order',
        'is_published',
    ];

    protected $casts = [
        'is_published'     => 'boolean',
        'order'            => 'integer',
        'duration_minutes' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function getFileUrlAttribute()
    {
        return $this->file_path
            ? \Storage::url($this->file_path)
            : null;
    }
}
