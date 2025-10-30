<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $token;
    public string $resetUrl;

    public function __construct(User $user, string $token)
    {
        $this->user  = $user;
        $this->token = $token;

        $base = config('app.frontend_url', 'http://localhost:5173');
        // Link que abrirá el usuario en el FRONT (tu pantalla de “reset”)
        $this->resetUrl = $base.'/reset-password?token='.$this->token.'&email='.urlencode($this->user->email);
    }

    // app/Mail/PasswordResetMail.php
    public function build()
    {
        $html = <<<HTML
<!doctype html>
<html>
  <body>
    <p>Hola {$this->user->name},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña en <strong>La Cuponera SV</strong>.</p>
    <p>Haz clic en el siguiente botón (o copia el enlace en tu navegador):</p>
    <p>
      <a href="{$this->resetUrl}" style="display:inline-block;padding:10px 16px;text-decoration:none;border-radius:6px;background:#1a73e8;color:#fff;">
        Restablecer contraseña
      </a>
    </p>
    <p style="word-break:break-all;">Enlace: {$this->resetUrl}</p>
    <p>Si no solicitaste este cambio, ignora este correo.</p>
    <p>— La Cuponera SV</p>
  </body>
</html>
HTML;

        return $this->subject('Recuperación de contraseña')
            ->html($html);
    }

}
