[![Known Vulnerabilities](https://snyk.io/test/github/diadal/universal-social-auth/badge.svg)](https://snyk.io/test/github/diadal/universal-social-auth)
<!-- [![Version](https://img.shields.io/npm/v/universal-social-auth/badge.svg.svg)](https://www.npmjs.org/package/universal-social-auth/badge.svg) -->
<!-- [![Build Status](https://www.travis-ci.com/diadal/universal-social-auth.svg?branch=main)](https://www.travis-ci.com/diadal/universal-social-auth) -->


# universal-social-auth
 SPA universal social auth

`Laravel`

`Php `

`Vue2`

`Vue3`

`Nuxt`

`React`

`Angularjs`

`More`

*if you wish you can buy me a coffee @ [Patreon](https://www.patreon.com/diadal)*

**universal-social-auth** is easily configurable solution for frontend frameworks [Vue2.js](https://vuejs.org/), [Vue3.js](https://v3.vuejs.org/), [Nuxtjs](https://nuxtjs.org/), [React](https://reactjs.org/), [Angularjs](https://angularjs.org/), [Otherjs Framework that support TypeScript & JavaScript](https://www.typescriptlang.org/) &
backend frameworks [Laravel](https://laravel.com/) and [Other Php Frameworks](https://www.php.net/) with Socialite that provides Social login using Github, Facebook, Google, Vkontakte and other OAuth providers can also work with [Nodejs](https://nodejs.org/en/) backend App. 

**NOTE:** 10x faster then `vue-social-auth` and less file sizes

**looking for old version** [vue-social-auth](https://github.com/diadal/vue-social-auth)

**WARNING:** Default request library is `axios`.

**NOTE:** It also work with any Php with `Socialite`

**NOTE:** New features*

**1:**  Ability to add none exsiting provider 

**2:**  importation only `Required` provider 

**3:**  No more `Buffer` fuction were call base on user request or needs 

**4:**  Optional how to handle addition security validation like `2fa` `Email code` if enabled by the user after first login 

**5:**  Support for Native App framework [Capacitorjs](https://capacitorjs.com/), [Ionic](https://ionicframework.com/), [Cordova](https://cordova.apache.org/), [Nativescript](https://nativescript.org/) & `More`

**Default Provider:** `Apple` `Facebook` `Google` `Github` `Instagram` `Twitter` `Bitbucket` `Linkedin` `Vkontakte` `Live` `Oauth1` & `Oauth2` 

**NOTE:** PR of New Provider can be submited default location `src/providers/index.ts`(https://github.com/diadal/universal-social-auth/src/providers/index.ts)

## Supported OAuth providers and configurations

## Installation

## firstly install `Socialite`

**NOTE:** make sure you config your `Socialite` configuration data in `services.php` & `.env` for more details
check  [https://socialiteproviders.netlify.com/](https://socialiteproviders.netlify.com/)

```bash
composer require laravel/socialite
or 
composer require socialiteproviders/github

```
## Next install universal-social-auth

```bash
npm install universal-social-auth
```
`Vue2 Example` (https://github.com/diadal/universal-social-auth-test-vu2)


## Usage

for Native App Frameworks config your APp to support Deep Link I used [capacitorjs](https://capacitorjs.com/docs/guides/deep-links) as an example and use [Emitter](https://github.com/developit/mitt) to pass data to page component

```javascript
// Optional for Native App main.[js|ts] or app.[js|ts]
 App.addListener('appUrlOpen', function (data) {
    const slug = data.url.split('.com').pop()
    if (slug) {
     /// redirectUri: 'https://myapp.com/auth/github/callback'
       const calback ='/callback' //string from reirectUri make this unique  
       const code = slug.split('code=').pop()
       const checker = slug?.toString().includes(calback) && code
       if (checker) {
         emitter.emit('OauthCall', code)
       }
       else{
            router.push({
            path: slug
          })
       }

    }
  })



 
```



```javascript
import axios, { AxiosInstance } from 'axios'
import UniversalSocialauth from 'universal-social-auth'
or import {UniversalSocialauth} from 'universal-social-auth'


`Vue3` declare module '@vue/runtime-core' {
            interface ComponentCustomProperties {
                $axios: AxiosInstance;
                $Oauth:UniversalSocialauth;

            }
            }
const options = {
  providers: {
    apple: {
      nonce: '**************',
      state: '**************',
      clientId: '**************',
      redirectUri: 'https://myapp.com/auth/github/callback'
    },
    github: {
      clientId: '**************',
      redirectUri: 'https://myapp.com/auth/github/callback'
    },
    google: {
      clientId: '***************',
      redirectUri: 'https://myapp.com/auth/google/callback'
    },
    facebook: {
      clientId: '************',
      redirectUri: 'https://myapp.com/auth/facebook/callback'
    },
    twitter: {
      url: 'https://myapp.com/auth/twitter',
      clientId: '********',
      redirectUri: 'https://myapp.com/auth/twitter/callback'
    }
  }
}

const Oauth:UniversalSocialauth = new UniversalSocialauth(axios, options)


`Vue2` Vue.prototype.$axios = axios
`Vue2` Vue.prototype.$Oauth = Oauth

`Vue3` app.config.globalProperties.$Oauth = Oauth
`Vue3` app.config.globalProperties.$axios = axios

`Other Framework` based on your global declaration
```

Button Method 1 note the `null` value this equal `null` if you import all provider
```html
<button @click="useAuthProvider('github', null)">auth Github</button>
<button @click="useAuthProvider('facebook', null)">auth Facebook</button>
<button @click="useAuthProvider('google', null)">auth Google</button>
<button @click="useAuthProvider('twitter', null)">auth Twitter</button>
```

Button Method 2 note the note provider name eg: `Github` each provider must the imported individually & custom provider can be added eg: `<button @click="useAuthProvider('mycustom', Mycustom)">auth Mycustom</button>` this give ability to add none existing `Provider`
```html
<button @click="useAuthProvider('github', Github)">auth Github</button>
<button @click="useAuthProvider('facebook', Facebook)">auth Facebook</button>
<button @click="useAuthProvider('google', Google)">auth Google</button>
<button @click="useAuthProvider('twitter', Twitter)">auth Twitter</button>
<button @click="useAuthProvider('mycustom', Mycustom)">auth Mycustom</button>
```

### View Component
```javascript
<script lang="ts">
import { ProderT } from 'universal-social-auth/dist/providers'

// Button Method 1
import { Providers} from 'universal-social-auth'

// Button Method 2
import { Github, Facebook, Google , Twitter} from 'universal-social-auth'
const MycustomProvider = {

    // Mycustom provider datas
}

// Below are the functions to use inside you export default be `Vue3 Setup()` or `Vue2 data()` or other `Framework`

 function useAuthProvider (provider:string, proData:Record<string, unknown>| null) {
      const pro = <ProderT>proData

      const ProData = pro || <ProderT>Providers[provider]
      box.$Oauth.authenticate(provider, ProData).then((response) => {
        const rsp:{code:string} = <{code:string}>response
        if (rsp.code) {
          responseData.value.code = rsp.code
          responseData.value.provider = provider
          useSocialLogin()
        }
      }).catch((err:unknown) => {
        console.log(err)
      })
    }


async function useLoginFirst (e: User) {
    // this sample of to pust user data to my store
      const firstlogin: boolean = await box.$auth.firstlogin(e)
      if (firstlogin) {
        const apm: string = box.$appName
        $q.notify({
          color: 'positive',
          textColor: 'white',
          message: `Welcome To ${apm}`,
          icon: 'mdi-alarm'
        })
        await box.$router.push({ name: 'dashboard' })
        return
      }
    }

  function useSocialLogin () {
      // otp from input Otp form 
      // hash user data in your backend with Cache or save to database
      const pdata = { code: responseData.value.code, otp: data.value.tok, hash: hash.value }
      box.$axios.post('/social-login/' + responseData.value.provider, pdata).then(async (response) => {
          // `response` data base on your backend config 
        if (response.data.status === 444) {
          hash.value = response.data.hash
          fauth.value = true // Option show Otp form incase you using 2fa or any addition security apply to your app you can handle all that from here 
       
        }else if (response.data.status === 445) {
          //do something Optional  
       
        }else {
        
          await useLoginFirst(response.data.u)
        }
      }).catch((err:unknown) => {
        
        console.log(err)
      })
    }
// Optional for Native App listen to the event `OauthCall` from your page component main.[js|ts] or app.[js|ts]

    emitter.on('OauthCall',  (e) => {
      if(e){

        responseData.value.code = e
        useSocialLogin()

      }


    })


</script>
```
**NOTE:**  Dont forget to off `emitter` `beforeDestroy` or `onBeforeUnmount` if you are building for Native App

#### Vue Router

```javascript

        {
          path: '/auth/:provider/callback',
          component: {
            template: '<div class="auth-component"></div>'
          }
        },

```

### Vue is Done let move to backend config `Laravel` with `Socialite`

#### Laravel Router

```php

Route::post('sociallogin/{provider}', 'Auth\AuthController@SocialSignup');
Route::get('auth/{provider}/callback', 'OutController@index')->where('provider', '.*');


```

#### OutController

```php

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OutController extends Controller
{


    public function __construct()
    {

    }


    public function index()
    {

      return view('welcome');

    }
}


```

#### Auth\AuthController

```php

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Socialite;

class AuthController extends Controller
{


    public function __construct()
    {

    }


    public function SocialSignup(Request $r, $provider)
    {
        $validator = Validator::make($r->all(), [
            'code' => 'nullable|string',
            'hash' => 'nullable|string',
            'otp' => 'nullable|numeric',
            'token' => 'nullable|string',
            'secret' => 'nullable|string',

        ]);
        if ($validator->fails()) {
            return [
                'message' => 'Incorrect Data Posted',
                'status' => 445,
            ];
        }

        $hash = $r->hash ?? null;
        $hashuser = Cache::get($hash);
        if ($hashuser) {
            return $this->SocialSignupNext($r, $hashuser);
        }
        try {
            // Socialite will pick response data automatic
            $user = Socialite::driver($provider)->stateless()->user();
            $token = $user->token ?? null;
            $refreshToken = $user->refreshToken ?? null;
            $expiresIn = $user->expiresIn ?? null;
            $tokenSecret = $user->tokenSecret ?? null;
            $id = $user->getId();
            $nickname = $user->getNickname();
            $name = $user->getName();
            $email = $user->getEmail();
            $profileImage = $user->getAvatar();

             $data =  [
                'name' => $name,
                'nickname' => $nickname,
                'profileImage' => $profileImage,
                'username' => '',
                'email' => $email,
                'provider' => $provider,
                'provider_id' => $id,
                'token' => $token,
                'tokenSecret' => $tokenSecret,
                'refreshToken' => $refreshToken,
                'expiresIn' => $expiresIn,

            ];
        // this is optional can be skip you can return your user data from here

        return $this->SocialSignupNext($r, $data);

        } catch (\Throwable $th) {
            logger($th);
        }

        return [
                'message' => 'Unknow Error',
                'status' => 445,
            ];
    }


    public function SocialSignupNext($request, $userdata)
    {
        $email = $this->xlean($userdata['email']);
        $provider = $this->clean($userdata['provider']);
        $provider_id = $this->clean($userdata['provider_id']);
        $name = $this->nlean($userdata['name']);
        $usr = User::where('email', $email)->get();

        $user =  $usr->where('provider', $provider)
            ->where('provider_id', $provider_id)
            ->first();

        if ($user) {
            return $this->SocialLogin($request, $user);
        }
        $user = $usr->first();
        if ($user) {
            $user->update([

                'provider' => $provider,
                'provider_id' => $provider_id,

            ]);
            return $this->SocialLogin($request, $user);
        }
        $u =  User::create([
            'name' => $name,
            'email' => $email,
            'provider' => $provider,
            'provider_id' => $provider_id,

        ]);
        // this is optional can be skip you can return your user data from here
        return $this->SocialLogin($request, $u);
    }



    public function SocialLogin($r, $user)
    {

        $hashid =  Str::random(12);

        // to verify additional security
        if ($user->google2fa_secret && !$this->mlean($r->otp)) {
            Cache::put($hashid, $user, now()->addMinutes(15));
            return [
                'message' => 'Unauthorized',
                'status' => 444,
                'hash' => $hashid
            ];
        }
        // check 2fa
        if ($this->mlean($r->otp)) {
            $g = \Google2FA::verifyKeyNewer(
                $user->google2fa_secret,
                ($this->mlean($r->otp)),
                $user->google2fa_ts
            );
            if (!$g) {
                return [
                    'message' => '2FA Expired Or Incorrect Code',
                    'status' => 445
                ];
            } else {
                $user->update([

                    'google2fa_ts' => $g

                ]);
                // optional incase you are using passport oAuth
                $tokenResult = $user->createToken('Personal Access Token');
                $token = $tokenResult->token;
                $token->save();
                return [
                    'u' => [
                        'data' => $tokenResult->accessToken,
                        'user' => $user
                    ]
                ];
            }
        }

        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->token;
        $token->save();

        return [
            'u' => [
                        'data' => $tokenResult->accessToken,
                        'user' => $user
                    ]
        ];
    }


}


```


#### services.php

```php

<?php

return [

   // .....

    'twitter' => [
        'client_id'     => env('TWITTER_ID'),
        'client_secret' => env('TWITTER_SECRET'),
        'redirect'      => env('TWITTER_URL'),
    ],

    'facebook' => [
        'client_id'     => env('FACEBOOK_ID'),
        'client_secret' => env('FACEBOOK_SECRET'),
        'redirect'      => env('FACEBOOK_URL'),
    ],

    'github' => [
        'client_id'     => env('GITHUB_ID'),
        'client_secret' => env('GITHUB_SECRET'),
        'redirect'      => env('GITHUB_URL'),
    ],

    'google' => [
        'client_id'     => env('GOOGLE_ID'),
        'client_secret' => env('GOOGLE_SECRET'),
        'redirect'      => env('GOOGLE_URL'),
    ],

    'vkontakte' => [
        'client_id'     => env('VKONTAKTE_KEY'),
        'client_secret' => env('VKONTAKTE_SECRET'),
        'redirect'      => env('VKONTAKTE_REDIRECT_URI'),
    ],
];


```

#### .env

```text

TWITTER_ID=Your ID
TWITTER_SECRET=Your Secret
TWITTER_URL=https://example.com/auth/twitter/callback

FACEBOOK_ID=Your ID
FACEBOOK_SECRET=Your Secret
FACEBOOK_URL=https://example.com/auth/facebook/callback

GITHUB_ID=Your ID
GITHUB_SECRET=Your Secret
GITHUB_URL=https://example.com/auth/github/callback

GOOGLE_ID=Your ID
GOOGLE_SECRET=Your Secret
GOOGLE_URL=https://example.com/auth/google/callback

VKONTAKTE_KEY=Your ID
VKONTAKTE_SECRET=Your Secret
VKONTAKTE_REDIRECT_URI=https://example.com/auth/vkontakte/callback

```

#### VerifyCsrfToken Middleware

you may need to disable Csrf for the route if you receive `Error: Request failed with status code 419`

```php

<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [

        '/sociallogin/*'
    ];
}


```

<!-- [travis-image]: https://travis-ci.com/diadal/universal-social-auth.svg?branch=master
[travis-url]: https://travis-ci.com/diadal/universal-social-auth -->

if any issue [check](https://github.com/diadal/universal-social-auth/issues)

*if you wish you can buy me a coffee @ [Patreon](https://www.patreon.com/diadal)*

## License

The MIT License (MIT)

Copyright (c) 2018 Diadal Nig LTD

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
