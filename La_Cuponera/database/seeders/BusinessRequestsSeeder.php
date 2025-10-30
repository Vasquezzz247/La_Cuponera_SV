<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessRequest;
use App\Models\User;

class BusinessRequestsSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Tomamos usuarios con rol 'user' (no admin / no business) para generar solicitudes PENDING
        $applicants = User::whereHas('roles', fn ($q) => $q->where('name', 'user'))
            ->take(6) // crea 6 solicitudes pendientes
            ->get();

        foreach ($applicants as $u) {
            BusinessRequest::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'status'               => 'pending',
                    'company_name'         => fake()->company(),
                    'company_nit'          => fake()->numerify('0614-######-###-#'),
                    'company_email'        => fake()->unique()->companyEmail(),
                    'company_phone'        => fake()->numerify('22##-####'),
                    'company_address'      => fake()->address(),
                    'company_description'  => fake()->sentence(10),
                    'platform_fee_percent' => fake()->numberBetween(5, 15),
                ]
            );
        }

        // 2) (Opcional) Crea algunas aprobadas para reporting, NO aparecerán en el listado (filtra 'pending')
        $businessUsers = User::whereHas('roles', fn ($q) => $q->where('name', 'business'))->take(3)->get();
        foreach ($businessUsers as $b) {
            BusinessRequest::updateOrCreate(
                ['user_id' => $b->id],
                [
                    'status'               => 'approved',
                    'company_name'         => fake()->company(),
                    'company_nit'          => fake()->numerify('0614-######-###-#'),
                    'company_email'        => $b->email,
                    'company_phone'        => fake()->numerify('22##-####'),
                    'company_address'      => fake()->address(),
                    'company_description'  => fake()->sentence(8),
                    'platform_fee_percent' => $b->platform_fee_percent ?? 10,
                ]
            );
        }

        // 3) (Opcional) Una rechazada de ejemplo
        $maybeUser = User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->inRandomOrder()->first();
        if ($maybeUser) {
            BusinessRequest::updateOrCreate(
                ['user_id' => $maybeUser->id],
                [
                    'status'               => 'rejected',
                    'company_name'         => fake()->company(),
                    'company_nit'          => fake()->numerify('0614-######-###-#'),
                    'company_email'        => fake()->unique()->companyEmail(),
                    'company_phone'        => fake()->numerify('22##-####'),
                    'company_address'      => fake()->address(),
                    'company_description'  => fake()->sentence(8),
                    'platform_fee_percent' => fake()->numberBetween(5, 15),
                ]
            );
        }
    }
}
