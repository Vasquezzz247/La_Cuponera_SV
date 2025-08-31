<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_profile_fields_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable()->after('name');
            $table->string('dui')->nullable()->unique()->after('email');
            // % comisión que se quedará la cuponera para este negocio (0–100)
            $table->decimal('platform_fee_percent', 5, 2)->nullable()->after('password');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_name','dui','platform_fee_percent']);
        });
    }
};
