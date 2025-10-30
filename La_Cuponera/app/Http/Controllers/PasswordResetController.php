<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;          // <— IMPORTANTE
use App\Mail\PasswordResetMail;               // <— IMPORTANTE

class PasswordResetController extends Controller
{
    private int $ttl = 60;

    public function requestReset(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($data['email']);

        $generic = ['message' => 'Si el correo existe, se ha enviado un enlace de recuperación.'];

        $user = User::where('email', $email)->first();
        if (!$user) {
            // No exponemos si existe o no
            return response()->json($generic);
        }

        // elimina tokens previos
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // genera token sin guardar en texto plano (guardamos hash)
        $rawToken = Str::random(64);
        $hash     = Hash::make($rawToken);

        DB::table('password_reset_tokens')->insert([
            'email'      => $email,
            'token'      => $hash,
            'created_at' => now(),
        ]);

        // ENVÍA EL CORREO
        Mail::to($email)->send(new PasswordResetMail($user, $rawToken));

        // Respuesta genérica (no devolvemos token)
        return response()->json($generic);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower($data['email']);

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();
        if (!$record) {
            return response()->json(['message' => 'Token inválido'], 422);
        }

        if (Carbon::parse($record->created_at)->lt(now()->subMinutes($this->ttl))) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json(['message' => 'Token expirado'], 422);
        }

        if (!Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Token inválido'], 422);
        }

        $user = User::where('email', $email)->firstOrFail();
        $user->password = Hash::make($data['password']);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }
}
