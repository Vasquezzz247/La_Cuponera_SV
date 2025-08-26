<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'regular_price' => (float) $this->regular_price,
            'offer_price'   => (float) $this->offer_price,
            'starts_at'     => $this->starts_at->toDateString(),
            'ends_at'       => $this->ends_at->toDateString(),
            'redeem_by'     => $this->redeem_by->toDateString(),
            'quantity'      => $this->quantity,
            'sold_out'      => $this->sold_out,
            'description'   => $this->description,
            'status'        => $this->status,
            'owner'         => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
            ],
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
        ];
    }
}
