# Laravel recipe

The browser runs `universal-social-auth`. It generates `state`, the PKCE verifier,
and `nonce`, and it checks `state` on return. Laravel receives the code and
exchanges it for tokens, so the client secret stays on the server.

## 1. Config

`config/services.php`:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'), // same value the browser sends
],
```

## 2. Route

`routes/api.php`:

```php
use App\Http\Controllers\SocialAuthController;

Route::post('/auth/google', [SocialAuthController::class, 'google']);
```

## 3. Controller

`app/Http/Controllers/SocialAuthController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SocialAuthController extends Controller
{
    public function google(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'codeVerifier' => ['required', 'string', 'min:43', 'max:128'],
            'nonce' => ['required', 'string'],
        ]);

        $token = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $data['code'],
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
            'code_verifier' => $data['codeVerifier'],
        ]);

        if ($token->failed()) {
            return response()->json(['message' => 'Token exchange failed'], 401);
        }

        // Verify the id_token (signature via Google's JWKS, iss, aud, exp, and nonce
        // equal to $data['nonce']) before trusting any claim. Then create or log in
        // the local user and issue your own session or API token.
        return response()->json(['ok' => true]);
    }
}
```

Use a JWT library such as `firebase/php-jwt` or Google's client library for the
ID-token check. Do not decode the token without verifying its signature.

## 4. Browser side

Post the result from `authenticate` to `/api/auth/google`. Use the
[Vue 3 example](../../examples/vue3-vite/) or the [vanilla example](../../examples/vanilla-ts/)
as a starting point.

See also: [Express recipe](./express.md), [Zintrust recipe](./zintrust.md).
