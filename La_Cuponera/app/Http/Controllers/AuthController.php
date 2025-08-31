<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\BusinessRequest;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username'        => 'required|string|min:3|max:50|alpha_num|unique:users,username',
            'email'           => 'required|string|email|max:255|unique:users,email',
            'password'        => 'required|string|min:6|confirmed',
            'name'            => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'dui'             => 'required|string|max:25|unique:users,dui',
            'date_of_birth'   => 'required|date|before_or_equal:' . now()->subYears(18)->toDateString(),
        ]);

        $user = User::create([
            'username'       => $request->username,
            'name'           => $request->name,
            'last_name'      => $request->last_name,
            'dui'            => $request->dui,
            'date_of_birth'  => $request->date_of_birth,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
        ]);

        $user->assignRole('user');

        $token = JWTAuth::fromUser($user);

        return response()->json(compact('user'), 201);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        return response()->json(compact('token'));
    }

    public function me()
    {
        return response()->json(auth()->user()->load('roles'));
    }

    // Logout
    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    //all users
    public function indexUsers()
    {
        $users = User::with('roles:id,name')->get(['id','name','email','created_at']);
        return response()->json($users);
    }

    public function requestBusiness(Request $request)
    {
        $user = auth()->user();

        if (BusinessRequest::where('user_id', $user->id)->where('status', 'pending')->exists()) {
            return response()->json(['message' => 'Ya tienes una solicitud pendiente'], 400);
        }

        $data = $request->validate([
            'company_name'          => 'required|string|max:255',
            'company_nit'           => 'required|string|max:30',
            'company_email'         => 'required|email|max:255',
            'company_phone'         => 'required|string|max:50',
            'company_address'       => 'required|string|max:255',
            'company_description'   => 'nullable|string|max:2000',
            'platform_fee_percent'  => 'required|numeric|min:0|max:100',
        ]);

        $req = BusinessRequest::create([
            'user_id' => $user->id,
            'status'  => 'pending',
            ...$data,
        ]);

        return response()->json(['message' => 'Solicitud enviada', 'request' => $req], 201);
    }

    public function listBusinessRequests()
    {
        $requests = BusinessRequest::with('user')->where('status', 'pending')->get();
        return response()->json($requests);
    }

    // Admin approves
    public function approveBusinessRequest($id)
    {
        $request = BusinessRequest::findOrFail($id);

        // Marca en BD
        $request->update(['status' => 'approved']);

        $user = $request->user;

        if (!is_null($request->platform_fee_percent)) {
            $user->platform_fee_percent = $request->platform_fee_percent;
            $user->save();
        }

        $user->assignRole('business');

        return response()->json([
            'message' => 'Solicitud aprobada',
            'user'    => $user,
            'request' => $request
        ]);
    }


    // Admin rejects
    public function rejectBusinessRequest($id)
    {
        $request = BusinessRequest::findOrFail($id);
        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Solicitud rechazada']);
    }
}
