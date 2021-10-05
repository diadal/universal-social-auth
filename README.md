[![Known Vulnerabilities](https://snyk.io/test/github/diadal/universal-social-auth/badge.svg)](https://snyk.io/test/github/diadal/universal-social-auth)
<!-- [![Version](https://img.shields.io/npm/v/universal-social-auth/badge.svg.svg)](https://www.npmjs.org/package/universal-social-auth/badge.svg) -->
<!-- [![Build Status](https://www.travis-ci.com/diadal/universal-social-auth.svg?branch=main)](https://www.travis-ci.com/diadal/universal-social-auth) -->

<!-- [travis-image]: https://travis-ci.com/diadal/universal-social-auth.svg?branch=master
[travis-url]: https://travis-ci.com/diadal/universal-social-auth -->

# Universal Social Auth
Universal frontend social media authenticator 

## Supported Frameworks
- Laravel
- PHP
- Vue v2 & v3
- Nuxt
- React
- Angularjs

## Supported Providers
- Apple
- Facebook
- Google
- Github
- Instagram
- Twitter
- Bitbucket
- Linkedin
- Vkontakte
- Live
- Oauth1
- Oauth2
- Twitch

## Donations
If you wish you can buy me a coffee @ [Patreon](https://www.patreon.com/diadal)

---

## **Installation**
### Installation - Backend
Laravel Socialite is required for this package. Don't forget the [configuration](https://laravel.com/docs/8.x/socialite#configuration)

```bash
composer require laravel/socialite
or
composer require socialiteproviders/github
```

### Installation - Frontend

```bash
npm install universal-social-auth
```

## Features
- Ability to add a custom provider 
- Importation only `Required` provider 
- No more `Buffer` functions were call base on user request or needs 
- Optional how to handle addition security validation like `2fa` `Email code` if enabled by the user after first login 
-  Support for Native App framework [Capacitorjs](https://capacitorjs.com/), [Ionic](https://ionicframework.com/), [Cordova](https://cordova.apache.org/), [Nativescript](https://nativescript.org/) & `More`


## Usage
- [Laravel Example]()
- [PHP Example]()
- [React Example]()
- [Vue 2 Example](https://github.com/diadal/universal-social-auth-test-vu2) 
- [Vue 3 Example]()
- [Angularjs Example]()
- [Nuxt Example]()

## Updates

- **looking for old version** [vue-social-auth](https://github.com/diadal/vue-social-auth)

- **NOTE:** 10x faster then `vue-social-auth` and less file sizes

- **WARNING:** Default request library is `axios`.

- **NOTE:** It also work with any Php with `Socialite`

- **NOTE:** PR of New Provider can be submited default location `src/providers/index.ts`(https://github.com/diadal/universal-social-auth/src/providers/index.ts)

## Issues
Create an [issue](https://github.com/diadal/universal-social-auth/issues)
