<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_company_fields_to_business_requests_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('business_requests', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_address')->nullable();
            $table->text('company_description')->nullable();
            // Propuesta de % comisión que el negocio ofrece a la cuponera
            $table->decimal('platform_fee_percent', 5, 2)->nullable();
        });
    }

    public function down(): void {
        Schema::table('business_requests', function (Blueprint $table) {
            $table->dropColumn([
                'company_name','company_phone','company_address',
                'company_description','platform_fee_percent'
            ]);
        });
    }
};
