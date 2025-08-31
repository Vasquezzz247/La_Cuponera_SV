<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\AdminReportController;

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
// Authenticated routes
// ----------------------------
Route::middleware('auth:api')->group(function () {

    // profile
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

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

    // buy offer
    Route::post('offers/{offer}/buy', [OfferController::class, 'buy'])->whereNumber('offer');

    // ------------------------
    // My coupons (user)
    // ------------------------
    Route::get('my/coupons', [OfferController::class, 'myCoupons']);

    // ------------------------
    // Business request (user → admin)
    // ------------------------
    Route::post('request-business', [AuthController::class, 'requestBusiness']);

    // ------------------------
    // Admin only
    // ------------------------
    Route::middleware('role:admin')->group(function () {
        // User manage
        Route::get('users', [AuthController::class, 'indexUsers']);

        // Role test
        Route::get('admin/ping', fn() => ['ok' => true, 'role' => 'admin']);

        // Business request
        Route::get('business-requests', [AuthController::class, 'listBusinessRequests']);
        Route::post('business-requests/{id}/approve', [AuthController::class, 'approveBusinessRequest']);
        Route::post('business-requests/{id}/reject', [AuthController::class, 'rejectBusinessRequest']);

        // ------------------------
        // Admin reports
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
