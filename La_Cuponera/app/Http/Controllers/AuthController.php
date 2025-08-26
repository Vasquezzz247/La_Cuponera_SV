<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\BusinessRequest;

class AuthController extends Controller
{
    // Registro
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('user'); // default role

        $token = JWTAuth::fromUser($user);

        return response()->json(compact('user', 'token'), 201);
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

    // Obtener usuario autenticado
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

    // Usuario solicita ser business
    public function requestBusiness()
    {
        $user = auth()->user();

        // Verificar si ya hay una solicitud pendiente
        if (BusinessRequest::where('user_id', $user->id)->where('status', 'pending')->exists()) {
            return response()->json(['message' => 'Ya tienes una solicitud pendiente'], 400);
        }

        $request = BusinessRequest::create([
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Solicitud enviada', 'request' => $request], 201);
    }

    public function listBusinessRequests()
    {
        $requests = BusinessRequest::with('user')->where('status', 'pending')->get();
        return response()->json($requests);
    }

    // Admin aprueba
    public function approveBusinessRequest($id)
    {
        $request = BusinessRequest::findOrFail($id);
        $request->update(['status' => 'approved']);

        $user = $request->user;
        $user->assignRole('business');

        return response()->json(['message' => 'Solicitud aprobada', 'user' => $user]);
    }

    // Admin rechaza
    public function rejectBusinessRequest($id)
    {
        $request = BusinessRequest::findOrFail($id);
        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Solicitud rechazada']);
    }
}
