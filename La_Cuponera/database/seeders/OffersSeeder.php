<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Offer;
use App\Models\User;
use Carbon\Carbon;

class OffersSeeder extends Seeder
{
    public function run(): void
    {
        $businessUsers = User::role('business')->get();
        $now = Carbon::now();

        $titles = [
            'Auriculares Bluetooth SoundPro',
            'Combo Café y Postre',
            'Membresía Mensual FitZone',
            'Set de Sábanas Premium',
            'Descuento en Ropa Casual',
            'Audífonos Gamer RGB',
            'Cámara de Seguridad WiFi',
            'Descuento 2x1 en Smoothies',
            'Clase de Spinning Gratis',
            'Laptop Lenovo IdeaPad 3',
            'Plancha de Cabello ProStyle',
            'Camiseta Dry-Fit Deportiva',
            'Cena para dos en Café Delicia',
            'Descuento 15% en Electrodomésticos',
            'Cargador Inalámbrico FastCharge',
        ];

        foreach ($titles as $title) {
            $biz = $businessUsers->random();
            Offer::updateOrCreate(
                ['title' => $title],
                [
                    'user_id'       => $biz->id,
                    'regular_price' => fake()->randomFloat(2, 10, 80),
                    'offer_price'   => fake()->randomFloat(2, 5, 50),
                    'starts_at'     => $now->copy()->subDays(rand(0, 5)),
                    'ends_at'       => $now->copy()->addDays(rand(10, 25)),
                    'redeem_by'     => $now->copy()->addDays(rand(30, 50)),
                    'quantity'      => rand(20, 100),
                    'description'   => fake()->sentence(10),
                    'image_path'    => null,
                ]
            );
        }
    }
}
