<?php
// database/migrations/2025_01_01_000000_add_payment_fields_to_coupons_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('coupons', function (Blueprint $table) {
            $table->decimal('unit_price', 10, 2)->nullable()->after('status');
            $table->decimal('platform_fee_percent', 5, 2)->nullable()->after('unit_price');
            $table->decimal('platform_fee_amount', 10, 2)->nullable()->after('platform_fee_percent');
            $table->decimal('business_amount', 10, 2)->nullable()->after('platform_fee_amount');
            $table->timestamp('paid_at')->nullable()->after('redeemed_at');
            $table->string('card_brand', 20)->nullable()->after('paid_at');
            $table->string('card_last4', 4)->nullable()->after('card_brand');
            $table->string('receipt_no', 30)->nullable()->unique()->after('card_last4');
        });
    }

    public function down(): void {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn([
                'unit_price','platform_fee_percent','platform_fee_amount',
                'business_amount','paid_at','card_brand','card_last4','receipt_no'
            ]);
        });
    }
};
