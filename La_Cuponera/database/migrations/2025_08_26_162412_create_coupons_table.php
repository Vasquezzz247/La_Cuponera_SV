<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // comprador
            $table->string('code', 32)->unique();
            $table->enum('status', ['active','redeemed','expired','refunded'])->default('active');
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
            $table->index(['offer_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('coupons');
    }
};
