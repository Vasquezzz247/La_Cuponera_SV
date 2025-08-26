<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OfferController;

Route::get('offers', [OfferController::class, 'indexPublic']);

Route::middleware('auth:api')->group(function () {

    Route::middleware('role:business')->group(function () {
        Route::post('offers', [OfferController::class, 'store']);
        Route::get('offers/mine', [OfferController::class, 'mine']);
        Route::put('offers/{offer}', [OfferController::class, 'update'])->whereNumber('offer');
        Route::patch('offers/{offer}', [OfferController::class, 'update'])->whereNumber('offer');
        Route::delete('offers/{offer}', [OfferController::class, 'destroy'])->whereNumber('offer');
    });

    Route::post('offers/{offer}/buy', [OfferController::class, 'buy'])->whereNumber('offer');
});

Route::get('offers/{offer}', [OfferController::class, 'show'])->whereNumber('offer');

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

    //request routes
    Route::post('request-business', [AuthController::class, 'requestBusiness']);

    Route::get('business-requests', [AuthController::class, 'listBusinessRequests'])
        ->middleware('role:admin');

    Route::post('business-requests/{id}/approve', [AuthController::class, 'approveBusinessRequest'])
        ->middleware('role:admin');

    Route::post('business-requests/{id}/reject', [AuthController::class, 'rejectBusinessRequest'])
        ->middleware('role:admin');
});
