<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'offer_id','user_id','code','status','redeemed_at'
    ];

    protected $casts = [
        'redeemed_at' => 'datetime',
    ];

    public function offer() { return $this->belongsTo(Offer::class); }
    public function buyer() { return $this->belongsTo(User::class, 'user_id'); }
}
