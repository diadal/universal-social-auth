# Laravel recipe

The browser runs `universal-social-auth`. Laravel creates a one-time state value
in the user's session before sign-in; the browser supplies it to the provider
and returns it with the authorization code. Laravel must compare and consume
that session value before exchanging the code. The library's callback check
alone does not protect a backend endpoint that accepts arbitrary codes.

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

`routes/web.php` (so Laravel's session middleware is active):

```php
use App\Http\Controllers\SocialAuthController;

Route::post('/api/auth/google/state', [SocialAuthController::class, 'state']);
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
    public function state(Request $request): JsonResponse
    {
        $state = bin2hex(random_bytes(32));
        $request->session()->put('oauth_state', $state);

        return response()->json(['state' => $state]);
    }

    public function google(Request $request): JsonResponse
    {
        $expectedState = $request->session()->get('oauth_state');
        $data = $request->validate([
            'code' => ['required', 'string'],
            'state' => ['required', 'string'],
            'codeVerifier' => ['required', 'string', 'min:43', 'max:128'],
            'nonce' => ['required', 'string'],
        ]);
        if (!is_string($expectedState) || !hash_equals($expectedState, $data['state'])) {
            return response()->json(['message' => 'Invalid OAuth state'], 401);
        }
        $request->session()->forget('oauth_state');

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

Before calling `authenticate`, POST to `/api/auth/google/state` with the same
session cookie and CSRF token, then configure Google with `state: () => state`
using the returned value. Include the callback's `state` with the result when
posting to Laravel. Keep both POST routes behind Laravel's CSRF protection. Use the
[Vue 3 example](../../examples/vue3-vite/) or the [vanilla example](../../examples/vanilla-ts/)
as a starting point.

See also: [Express recipe](./express.md), [Zintrust recipe](./zintrust.md).
