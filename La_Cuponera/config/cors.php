<?php

return [
    // Aplica CORS a TODAS las rutas (tienes endpoints sin /api)
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    // Permite tu front local y luego el dominio de Vercel
    'allowed_origins' => [
        'http://localhost:5173',
        'https://localhost:5173',
    ],

    // Cuando despliegues el front en Vercel, esto permite *.vercel.app
    'allowed_origins_patterns' => ['#^https://.+\.vercel\.app$#'],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Si usas tokens Bearer, déjalo en false
    'supports_credentials' => false,
];
