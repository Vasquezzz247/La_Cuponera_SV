<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\PasswordResetController;

// ----------------------------
// Public offers
// ----------------------------
Route::get('offers', [OfferController::class, 'indexPublic']);
Route::get('offers/{offer}', [OfferController::class, 'show'])->whereNumber('offer');

// ----------------------------
// Auth (register/login)
// ----------------------------
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// ----------------------------
// Password reset (públicas)
// ----------------------------
Route::post('password/forgot', [PasswordResetController::class, 'requestReset'])->middleware('throttle:5,1');
Route::post('password/reset',  [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');

// ----------------------------
// Authenticated routes
// ----------------------------
Route::middleware('auth:api')->group(function () {

    // Perfil / sesión
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // ------------------------
    // Cambio de contraseña (logueado)
    // ------------------------
    Route::post('password/change', [AuthController::class, 'changePassword']);

    // ------------------------
    // Business only
    // ------------------------
    Route::middleware('role:business')->group(function () {
        Route::post('offers', [OfferController::class, 'store']);
        Route::get('offers/mine', [OfferController::class, 'mine']);
        Route::put('offers/{offer}', [OfferController::class, 'update'])->whereNumber('offer');
        Route::patch('offers/{offer}', [OfferController::class, 'update'])->whereNumber('offer');
        Route::delete('offers/{offer}', [OfferController::class, 'destroy'])->whereNumber('offer');
    });

    // Comprar oferta
    Route::post('offers/{offer}/buy', [OfferController::class, 'buy'])->whereNumber('offer');

    // ------------------------
    // Mis cupones
    // ------------------------
    Route::get('my/coupons', [OfferController::class, 'myCoupons']);

    // ------------------------
    // Solicitud de empresa (user → admin)
    // ------------------------
    Route::post('request-business', [AuthController::class, 'requestBusiness']);

    // ------------------------
    // Admin only
    // ------------------------
    Route::middleware('role:admin')->group(function () {
        // Gestión de usuarios
        Route::get('users', [AuthController::class, 'indexUsers']);

        // Cambiar rol de usuarios (nuevo)
        Route::post('admin/users/{id}/role', [AuthController::class, 'changeUserRole'])->whereNumber('id');

        // Crear nuevos administradores
        Route::post('users/admin', [AuthController::class, 'registerAdmin']);

        // Test de rol admin
        Route::get('admin/ping', fn() => ['ok' => true, 'role' => 'admin']);

        // Solicitudes de negocio
        Route::get('business-requests', [AuthController::class, 'listBusinessRequests']);
        Route::post('business-requests/{id}/approve', [AuthController::class, 'approveBusinessRequest']);
        Route::post('business-requests/{id}/reject', [AuthController::class, 'rejectBusinessRequest']);

        // ------------------------
        // Reportes (admin)
        // ------------------------
        Route::get('admin/reports/companies', [AdminReportController::class, 'byCompany']);
        Route::get('admin/reports/companies/{user}', [AdminReportController::class, 'companyDetail'])->whereNumber('user');
    });

    // ------------------------
    // Business ping
    // ------------------------
    Route::get('business/ping', fn() => ['ok' => true, 'role' => 'business'])
        ->middleware('role:business');
});
