<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->date('enrollment_start')->nullable()->after('end_date');
            $table->date('enrollment_end')->nullable()->after('enrollment_start');
        });
    }

    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn(['enrollment_start', 'enrollment_end']);
        });
    }
};
