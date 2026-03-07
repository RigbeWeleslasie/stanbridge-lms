<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'rejected'])
                  ->default('pending')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])
                  ->default('active')
                  ->change();
        });
    }
};
