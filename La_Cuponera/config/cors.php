<?php

return [
    // Aplica a todas las rutas (incluye /api/*)
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'https://localhost:5173',
        'https://la-cuponera-sv-ulip.vercel.app',
    ],

    // Cuando subas el front a Vercel:
    'allowed_origins_patterns' => ['#^https://.+\.vercel\.app$#'],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    'supports_credentials' => false,
];
