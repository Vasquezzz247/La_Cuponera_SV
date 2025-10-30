<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOfferRequest;
use App\Http\Requests\UpdateOfferRequest;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\BuyOfferRequest;

class OfferController extends Controller
{
    public function indexPublic(Request $request)
    {
        $q = Offer::query()
            ->visible()
            ->with('owner:id,name')
            ->withCount('coupons');

        // si hay un query ?q=busqueda
        if ($search = $request->query('q')) {
            $q->where('title', 'ilike', "%{$search}%");
        }

        $offers = $q->paginate(12);

        return OfferResource::collection($offers);
    }

    // create offer
    public function store(StoreOfferRequest $request)
    {
        $this->authorize('create', Offer::class);

        $data = $request->validated();
        $data['user_id'] = auth()->id();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('offers', 'public');
            $data['image_path'] = $path;
        }

        $offer = Offer::create($data);

        return new OfferResource($offer->load('owner'));
    }

    // my offers
    public function mine()
    {
        $offers = Offer::where('user_id', auth()->id())
            ->latest()->paginate(15);
        return OfferResource::collection($offers);
    }

    // get offers
    public function show(Offer $offer)
    {
        return new OfferResource($offer->load('owner'));
    }

    public function update(UpdateOfferRequest $request, Offer $offer)
    {
        $this->authorize('update', $offer);

        $offer->fill($request->validated());

        if ($request->hasFile('image')) {
            if ($offer->image_path) \Storage::disk('public')->delete($offer->image_path);
            $offer->image_path = $request->file('image')->store('offers', 'public');
        }

        $dirty = $offer->isDirty();
        if ($dirty) $offer->save();

        return (new OfferResource($offer->refresh()->load('owner')))
            ->additional(['meta' => ['updated' => $dirty]]);
    }

    // delete
    public function destroy(Offer $offer)
    {
        $this->authorize('delete', $offer);
        $offer->delete();
        return response()->json(['message' => 'Oferta eliminada']);
    }

    // buy offer
    public function buy(BuyOfferRequest $request, Offer $offer)
    {
        $user = auth()->user();

        if ($user->id === $offer->user_id) {
            return response()->json(['message' => 'No puedes comprar tu propia oferta'], 403);
        }

        $isVisible = Offer::whereKey($offer->id)->visible()->exists();
        if (!$isVisible) {
            return response()->json(['message' => 'La oferta no está disponible'], 422);
        }

        $already = Coupon::where('offer_id', $offer->id)
            ->where('user_id', $user->id)
            ->count();
        if ($already >= 5) {
            return response()->json(['message' => 'Límite de 5 cupones para esta oferta'], 422);
        }

        $offer->loadCount('coupons');
        if (!is_null($offer->quantity) && $offer->coupons_count >= $offer->quantity) {
            return response()->json(['message' => 'Agotado'], 422);
        }

        // Pago simulado (igual que tenías)
        $num = preg_replace('/\D/', '', $request->card_number);
        $brand = match (true) {
            str_starts_with($num, '4') => 'visa',
            str_starts_with($num, '5') => 'mastercard',
            str_starts_with($num, '3') => 'amex',
            default => 'card'
        };
        $last4 = substr($num, -4);

        $unit = (float) $offer->offer_price;
        $pct  = (float) ($offer->owner->platform_fee_percent ?? 0);
        $fee  = round($unit * $pct / 100, 2);
        $biz  = round($unit - $fee, 2);

        if (!is_null($offer->quantity) && ($offer->coupons_count + 1) > $offer->quantity) {
            return response()->json(['message' => 'Agotado'], 422);
        }
        if (($already + 1) > 5) {
            return response()->json(['message' => 'Límite de 5 cupones para esta oferta'], 422);
        }

        $coupon = DB::transaction(function () use ($offer, $user, $unit, $pct, $fee, $biz, $brand, $last4) {
            do { $code = \Str::upper(\Str::random(12)); } while (Coupon::where('code', $code)->exists());
            do { $receipt = 'R-' . \Str::upper(\Str::random(10)); } while (Coupon::where('receipt_no', $receipt)->exists());

            $coupon = Coupon::create([
                'offer_id' => $offer->id,
                'user_id'  => $user->id,
                'code'     => $code,
                'status'   => 'active',
                'unit_price' => $unit,
                'platform_fee_percent' => $pct,
                'platform_fee_amount'  => $fee,
                'business_amount'      => $biz,
                'paid_at'   => now(),
                'card_brand'=> $brand,
                'card_last4'=> $last4,
                'receipt_no'=> $receipt,
            ]);

            $totalCents = (int) round(($biz + $fee) * 100);
            Offer::whereKey($offer->id)->update([
                'purchases_count' => DB::raw('purchases_count + 1'),
                'tickets_sold'    => DB::raw('tickets_sold + 1'),
                'revenue_cents'   => DB::raw("revenue_cents + {$totalCents}"),
                'updated_at'      => now(),
            ]);

            return $coupon;
        });

        return response()->json([
            'message' => 'Compra realizada',
            'amounts' => [
                'unit_price' => $unit,
                'platform_fee_percent' => $pct,
                'platform_fee_amount'  => $fee,
                'business_amount'      => $biz,
            ],
            'coupon'  => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'status' => $coupon->status,
                'offer_id' => $offer->id,
                'redeem_by' => $offer->redeem_by->toDateString(),
                'receipt_no' => $coupon->receipt_no,
                'card_brand' => $coupon->card_brand,
                'card_last4' => $coupon->card_last4,
            ],
        ], 201);
    }

    public function myCoupons(Request $request)
    {
        $user = auth()->user();

        $coupons = Coupon::with(['offer:id,title,redeem_by,offer_price'])
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(15);

        $data = $coupons->getCollection()->map(function ($c) {
            return [
                'id'            => $c->id,
                'code'          => $c->code,
                'status'        => $c->status,
                'paid_at'       => $c->paid_at?->toIso8601String(), // ahora sí es Carbon
                'receipt_no'    => $c->receipt_no,
                'card_brand'    => $c->card_brand,
                'card_last4'    => $c->card_last4,
                'offer' => [
                    'id'          => $c->offer->id,
                    'title'       => $c->offer->title,
                    'price'       => (float) $c->offer->offer_price,
                    'redeem_by'   => $c->offer->redeem_by->toDateString(),
                ],
            ];
        });

        $coupons->setCollection($data);

        return response()->json($coupons);
    }
}
