<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','title','regular_price','offer_price','starts_at','ends_at',
        'redeem_by','quantity','description','status'
    ];

    protected $casts = [
        'regular_price' => 'decimal:2',
        'offer_price'   => 'decimal:2',
        'starts_at'     => 'date',
        'ends_at'       => 'date',
        'redeem_by'     => 'date',
    ];

    public function owner() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function coupons() {
        return $this->hasMany(Coupon::class);
    }

    public function scopeWindow(Builder $q): Builder {
        $today = now()->startOfDay();
        return $q->where('status', 'available')
            ->whereDate('starts_at', '<=', $today)
            ->whereDate('ends_at', '>=', $today);
    }

    public function scopeVisible(Builder $q): Builder
    {
        $today = now()->startOfDay();

        return $q->where('status', 'available')
            ->whereDate('starts_at', '<=', $today)
            ->whereDate('ends_at', '>=', $today)
            ->where(function ($qq) {
                // ilimitado (quantity NULL) => siempre visible
                $qq->whereNull('quantity')
                    // limitado => visible sólo si vendidos < quantity
                    ->orWhereRaw('(SELECT COUNT(*) FROM coupons c WHERE c.offer_id = offers.id) < quantity');
            });
    }

    public function getSoldOutAttribute(): bool {
        if (is_null($this->quantity)) return false;
        $count = $this->relationLoaded('coupons_count')
            ? $this->coupons_count
            : $this->coupons()->count();
        return $count >= $this->quantity;
    }
}
