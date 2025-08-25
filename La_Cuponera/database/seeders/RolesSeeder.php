<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles
        foreach (['user', 'admin', 'business'] as $r) {
            Role::findOrCreate($r, 'api');
        }

        // Usuario admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin Test', 'password' => bcrypt('password')]
        );
        $admin->assignRole('admin');

        // Usuario business
        $business = User::firstOrCreate(
            ['email' => 'business@example.com'],
            ['name' => 'Business Test', 'password' => bcrypt('password')]
        );
        $business->assignRole('business');

        // Usuario normal
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            ['name' => 'User Test', 'password' => bcrypt('password')]
        );
        $user->assignRole('user');
    }
}
