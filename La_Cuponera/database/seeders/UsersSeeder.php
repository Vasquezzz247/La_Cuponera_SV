<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // === Crear roles ===
        foreach (['user', 'business', 'admin'] as $r) {
            Role::findOrCreate($r, 'api');
        }

        // === Admin ===
        $admin = User::updateOrCreate(
            ['email' => 'admin@cuponera.sv'],
            [
                'name' => 'Administrador',
                'last_name' => 'Central',
                'dui' => '0612-010190-101-1',
                'username' => 'admin',
                'date_of_birth' => '1990-01-01',
                'password' => Hash::make('admin123'),
            ]
        );
        $admin->assignRole('admin');

        // === Empresas ===
        $businesses = [
            ['TecnoPlus S.A. de C.V.', 'Carlos', 'López', 'carlos@tecnoplus.sv', 10],
            ['Café Delicia', 'María', 'Pérez', 'maria@cafedelicia.sv', 8],
            ['FitZone Gym', 'Luis', 'Martínez', 'luis@fitzone.sv', 12],
            ['ElectroHome', 'Andrea', 'Reyes', 'andrea@electrohome.sv', 9],
            ['FashionCity', 'Karla', 'Gómez', 'karla@fashioncity.sv', 7],
        ];

        foreach ($businesses as [$company, $name, $last, $email, $fee]) {
            $b = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'last_name' => $last,
                    'dui' => fake()->unique()->numerify('0#######-#'),
                    'username' => strtolower(explode('@', $email)[0]),
                    'date_of_birth' => fake()->date('Y-m-d', '2000-01-01'),
                    'password' => Hash::make('business123'),
                    'platform_fee_percent' => $fee,
                ]
            );
            $b->assignRole('business');
        }

        // === Usuarios normales ===
        for ($i = 1; $i <= 10; $i++) {
            $u = User::updateOrCreate(
                ['email' => "cliente{$i}@gmail.com"],
                [
                    'name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'dui' => fake()->unique()->numerify('0#######-#'),
                    'username' => "cliente{$i}",
                    'date_of_birth' => fake()->date('Y-m-d', '2004-01-01'),
                    'password' => Hash::make('user123'),
                ]
            );
            $u->assignRole('user');
        }
    }
}
