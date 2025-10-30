<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;
use App\Models\User;
use App\Models\Offer;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CouponsSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::role('user')->get();
        $offers = Offer::all();

        foreach ($users as $u) {
            $userOffers = $offers->random(rand(2, 4));
            foreach ($userOffers as $offer) {
                for ($i = 0; $i < rand(1, 3); $i++) {
                    Coupon::create([
                        'offer_id' => $offer->id,
                        'user_id' => $u->id,
                        'code' => Str::upper(Str::random(10)),
                        'status' => 'active',
                        'unit_price' => $offer->offer_price,
                        'platform_fee_percent' => $offer->owner->platform_fee_percent ?? 10,
                        'platform_fee_amount' => round($offer->offer_price * (($offer->owner->platform_fee_percent ?? 10) / 100), 2),
                        'business_amount' => round($offer->offer_price - $offer->offer_price * (($offer->owner->platform_fee_percent ?? 10) / 100), 2),
                        'paid_at' => Carbon::now()->subDays(rand(0, 10)),
                        'card_brand' => ['visa', 'mastercard', 'amex'][rand(0, 2)],
                        'card_last4' => rand(1000, 9999),
                        'receipt_no' => 'R-' . Str::upper(Str::random(8)),
                    ]);
                }
            }
        }
    }
}
