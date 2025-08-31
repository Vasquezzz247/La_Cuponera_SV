<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'offer_id','user_id','code','status','redeemed_at',
        'unit_price','platform_fee_percent','platform_fee_amount',
        'business_amount','paid_at','card_brand','card_last4','receipt_no'
    ];

    protected $casts = [
        'redeemed_at'            => 'datetime',
        'paid_at'                => 'datetime',     // <-- importante
        'unit_price'             => 'decimal:2',
        'platform_fee_percent'   => 'decimal:2',
        'platform_fee_amount'    => 'decimal:2',
        'business_amount'        => 'decimal:2',
    ];

    public function offer() { return $this->belongsTo(Offer::class); }
    public function buyer() { return $this->belongsTo(User::class, 'user_id'); }
}
