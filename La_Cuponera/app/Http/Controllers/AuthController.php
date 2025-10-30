<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\BusinessRequest;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

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

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required|string',
            'new_password'          => ['required','string','min:6','confirmed'],
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual no es correcta'], 422);
        }

        // evita reutilizar la misma contraseña
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json(['message' => 'La nueva contraseña no puede ser igual a la actual'], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (\Throwable $e) {

        }

        return response()->json([
            'message' => 'Contraseña actualizada. Vuelve a iniciar sesión.'
        ]);
    }

    // Admin rejects
    public function rejectBusinessRequest($id)
    {
        $request = BusinessRequest::findOrFail($id);
        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Solicitud rechazada']);
    }

    // ---------------------------------------------------------
    // NUEVO MÉTODO: Cambiar rol de usuarios (solo admin)
    // ---------------------------------------------------------
    public function changeUserRole(Request $request, $id)
    {
        $data = $request->validate([
            'role' => ['required', 'string', Rule::in(['user', 'business', 'admin'])],
        ]);

        $current = auth()->user();
        $target = User::findOrFail($id);
        $newRole = $data['role'];

        // 1) no puede cambiar su propio rol
        if ($current->id === $target->id) {
            return response()->json(['message' => 'No puedes cambiar tu propio rol.'], 422);
        }

        // 2) no se puede convertir a admin a un business
        if ($newRole === 'admin' && $target->hasRole('business')) {
            return response()->json(['message' => 'Un usuario con rol business no puede convertirse en admin.'], 422);
        }

        // 3) no se puede quitar el rol admin si es el último admin
        if ($target->hasRole('admin') && $newRole !== 'admin') {
            $adminCount = Role::where('name', 'admin')->first()?->users()->count() ?? 0;
            if ($adminCount <= 1) {
                return response()->json(['message' => 'No puedes eliminar el último administrador del sistema.'], 422);
            }
        }

        // Verificar rol válido
        if (!Role::where('name', $newRole)->exists()) {
            return response()->json(['message' => 'Rol inválido.'], 422);
        }

        $target->syncRoles([$newRole]);

        return response()->json([
            'message' => "Rol actualizado a '{$newRole}'",
            'user' => [
                'id' => $target->id,
                'email' => $target->email,
                'roles' => $target->getRoleNames(),
            ],
        ]);
    }
}
