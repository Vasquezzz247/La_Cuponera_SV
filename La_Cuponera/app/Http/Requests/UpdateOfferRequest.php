<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOfferRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array {
        return [
            'title'         => 'sometimes|required|string|max:140',
            'regular_price' => 'sometimes|required|numeric|min:0',
            'offer_price'   => 'sometimes|required|numeric|min:0|lte:regular_price',
            'starts_at'     => 'sometimes|required|date',
            'ends_at'       => 'sometimes|required|date|after_or_equal:starts_at',
            'redeem_by'     => 'sometimes|required|date|after_or_equal:ends_at',
            'quantity'      => 'nullable|integer|min:1',
            'description'   => 'nullable|string',
            'status'        => 'sometimes|required|in:available,unavailable',
        ];
    }
}
