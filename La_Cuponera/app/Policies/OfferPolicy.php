<?php

namespace App\Policies;

use App\Models\Offer;
use App\Models\User;

class OfferPolicy
{
    public function viewAny(?User $user): bool { return true; }
    public function view(?User $user, Offer $offer): bool { return true; }

    public function create(User $user): bool {
        return $user->hasRole('business') || $user->hasRole('admin');
    }

    public function update(User $user, Offer $offer): bool {
        return $user->id === $offer->user_id || $user->hasRole('admin');
    }

    public function delete(User $user, Offer $offer): bool {
        return $user->id === $offer->user_id || $user->hasRole('admin');
    }
}
