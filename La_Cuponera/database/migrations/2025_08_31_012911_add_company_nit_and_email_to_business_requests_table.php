<?php

// database/migrations/XXXX_XX_XX_XXXXXX_add_company_nit_and_email_to_business_requests_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('business_requests', function (Blueprint $table) {
            $table->string('company_nit', 30)->nullable()->after('company_name');
            $table->string('company_email')->nullable()->after('company_nit');
        });
    }

    public function down(): void {
        Schema::table('business_requests', function (Blueprint $table) {
            $table->dropColumn(['company_nit','company_email']);
        });
    }
};
