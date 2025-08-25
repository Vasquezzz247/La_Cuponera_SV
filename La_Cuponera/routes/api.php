<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // ver todos los usuarios
    Route::get('users', [AuthController::class, 'indexUsers'])
        ->middleware('role:admin');

    // Rutas de prueba de roles:
    Route::get('admin/ping', fn() => ['ok' => true, 'role' => 'admin'])
        ->middleware('role:admin');

    Route::get('business/ping', fn() => ['ok' => true, 'role' => 'business'])
        ->middleware('role:business');
});
