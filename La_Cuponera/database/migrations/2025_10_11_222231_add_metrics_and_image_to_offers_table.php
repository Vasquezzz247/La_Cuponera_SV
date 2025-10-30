<?php

// database/migrations/2025_10_11_000000_add_metrics_and_image_to_offers.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::table('offers', function (Blueprint $table) {
            $table->unsignedBigInteger('purchases_count')->default(0)->after('status');
            $table->unsignedBigInteger('tickets_sold')->default(0)->after('purchases_count');
            $table->unsignedBigInteger('revenue_cents')->default(0)->after('tickets_sold');
            $table->string('image_path')->nullable()->after('revenue_cents');
        });

        // Backfill desde coupons (si ya tienes ventas)
        DB::statement("
            UPDATE offers o
            SET purchases_count = s.purchases,
                tickets_sold    = s.qty,
                revenue_cents   = s.revenue_cents
            FROM (
              SELECT offer_id,
                     COUNT(*)              AS purchases,
                     COALESCE(SUM(1),0)    AS qty, -- 1 cupón = 1 ticket en tu flujo actual
                     COALESCE(SUM((business_amount + platform_fee_amount) * 100),0) AS revenue_cents
              FROM coupons
              GROUP BY offer_id
            ) s
            WHERE s.offer_id = o.id
        ");
    }

    public function down(): void {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['purchases_count','tickets_sold','revenue_cents','image_path']);
        });
    }
};
