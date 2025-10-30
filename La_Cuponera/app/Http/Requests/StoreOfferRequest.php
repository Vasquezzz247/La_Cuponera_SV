<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array {
        return [
            'title'         => 'required|string|max:140',
            'regular_price' => 'required|numeric|min:0',
            'offer_price'   => 'required|numeric|min:0|lte:regular_price',
            'starts_at'     => 'required|date',
            'ends_at'       => 'required|date|after_or_equal:starts_at',
            'redeem_by'     => 'required|date|after_or_equal:ends_at',
            'quantity'      => 'nullable|integer|min:1',
            'description'   => 'nullable|string',
            'status'        => 'required|in:available,unavailable',
            'image'         => 'nullable|image|max:5120', // 5MB
        ];
    }
}
