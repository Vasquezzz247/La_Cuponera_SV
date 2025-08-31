<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOfferRequest;
use App\Http\Requests\UpdateOfferRequest;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
            $q->where('title', 'ilike', "%{$search}%"); // ilike es PostgreSQL case-insensitive
        }

        $offers = $q->paginate(12);

        return OfferResource::collection($offers);
    }

    // create offer
    public function store(StoreOfferRequest $request)
    {
        $this->authorize('create', Offer::class);

        $offer = Offer::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

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

    // udate
    public function update(UpdateOfferRequest $request, Offer $offer)
    {
        $this->authorize('update', $offer);

        $offer->fill($request->validated());
        $dirty = $offer->isDirty();   // ¿cambió algo?
        if ($dirty) {
            $offer->save();
        }

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
    public function buy(Request $request, Offer $offer)
    {
        $user = auth()->user();

        // No permitir que el dueño compre su propia oferta (opcional)
        if ($user->id === $offer->user_id) {
            return response()->json(['message' => 'No puedes comprar tu propia oferta'], 403);
        }

        $isVisible = Offer::whereKey($offer->id)->visible()->exists();
        if (!$isVisible) {
            return response()->json(['message' => 'La oferta no está disponible'], 422);
        }

        // check quantity
        $offer->loadCount('coupons');
        if (!is_null($offer->quantity) && $offer->coupons_count >= $offer->quantity) {
            return response()->json(['message' => 'Agotado'], 422);
        }

        // Generar código único
        $code = null;
        do { $code = Str::upper(Str::random(12)); }
        while (Coupon::where('code', $code)->exists());

        $coupon = Coupon::create([
            'offer_id' => $offer->id,
            'user_id'  => $user->id,
            'code'     => $code,
            'status'   => 'active',
        ]);

        return response()->json([
            'message' => 'Compra realizada',
            'coupon'  => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'status' => $coupon->status,
                'offer_id' => $offer->id,
                'redeem_by' => $offer->redeem_by->toDateString(),
            ],
        ], 201);
    }
}
