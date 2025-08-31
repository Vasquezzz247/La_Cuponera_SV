<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','status',
        'company_name','company_nit','company_email','company_phone','company_address','company_description',
        'platform_fee_percent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
