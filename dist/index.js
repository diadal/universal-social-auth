!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.UniversalSocialauth=e():t.UniversalSocialauth=e()}(self,(function(){return(()=>{"use strict";var t={d:(e,o)=>{for(var i in o)t.o(o,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:o[i]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{Bitbucket:()=>k,Facebook:()=>v,Github:()=>b,Google:()=>y,Instagram:()=>U,Linkedin:()=>C,Live:()=>P,Oauth1:()=>S,Oauth2:()=>j,Providers:()=>w,Twitter:()=>O,UniversalSocialauth:()=>f,Vkontakte:()=>I,default:()=>_});const o={baseUrl:null,tokenName:"token",tokenPrefix:"vueauth",tokenHeader:"Authorization",tokenType:"Bearer",loginUrl:"/auth/login",registerUrl:"/auth/register",logoutUrl:null,storageType:"localStorage",storageNamespace:"vue3-social-auth",cookieStorage:{domain:window.location.hostname,path:"/",secure:!1},requestDataKey:"data",responseDataKey:"data",bindRequestInterceptor:function(t){const e=t.options.tokenHeader;t.$http.interceptors.request.use((t=>(delete t.headers[e],t)))},bindResponseInterceptor:function(t){t.$http.interceptors.response.use((t=>(console.log("bindResponseInterceptor",t),t)))},provider:{}};function i(t,e){if(/^(?:[a-z]+:)?\/\//i.test(e))return e;return[t,e].join("/").replace(/[/]+/g,"/").replace(/\/\?/g,"?").replace(/\/#/g,"#").replace(/:\//g,"://")}function n(t){const e="https:"===t.protocol;return t.protocol+"//"+t.hostname+":"+(t.port||(e?"443":"80"))+(/^\//.test(t.pathname)?t.pathname:"/"+t.pathname)}function r(t){const e={};let o,i;return(t||"").split("&").forEach((t=>{t&&(i=t.split("="),o=decodeURIComponent(i[0]),e[o]=!i[1]||decodeURIComponent(i[1]))})),e}function s(t){const{path:e,domain:o,expires:i,secure:n}=t;return[null==e?"":";path="+e,null==o?"":";domain="+o,null==i?"":";expires="+i.toUTCString(),null==n||!1===n?"":";secure"].join("")}function a(t,e,o){return[encodeURIComponent(t),"=",encodeURIComponent(e),s(o)].join("")}class p{constructor(t,e,o){this.popup=null,this.url=t,this.name=e,this.popupOptions=o}open(t,e){try{if(this.popup=window.open(this.url,this.name,this._stringifyOptions()),this.popup&&this.popup.focus&&this.popup.focus(),e)return Promise.resolve();{const e=this.pooling(t);return console.log("pool",e),e}}catch(t){return Promise.reject(new Error("OAuth popup error occurred"))}}pooling(t){return new Promise((e=>{const o=document.createElement("a");o.href=t;const i=n(o);let s=window.setInterval((()=>{this.popup&&!this.popup.closed&&void 0!==this.popup.closed||(clearInterval(s),s=0,c(new Error("Auth popup window closed")));try{const t=this.popup,o=n(t.location);if(console.log("location.location",t.location),console.log("redirectUriPath",i),o===i){if(t.location.search||t.location.hash){const o=r(t.location.search.substring(1).replace(/\/$/,"")),i=r(t.location.hash.substring(1).replace(/[/$]/,"")),n=Object.assign(Object.assign({},o),i);n.error?c(new Error(n.error)):e(n)}else c(new Error("OAuth redirect has occurred but no query or hash parameters were found."));clearInterval(s),s=0,t.close()}}catch(t){}}),250)}))}_stringifyOptions(){const t=[],e=this.popupOptions;console.log("Popup",e);for(const o in e)void 0!==e[o]&&t.push(`${o}=${e[o]}`);return t.join(",")}}function c(t){throw new Error(`Function not implemented. ${t}`)}var u=function(t,e,o,i){return new(o||(o=Promise))((function(n,r){function s(t){try{p(i.next(t))}catch(t){r(t)}}function a(t){try{p(i.throw(t))}catch(t){r(t)}}function p(t){var e;t.done?n(t.value):(e=t.value,e instanceof o?e:new o((function(t){t(e)}))).then(s,a)}p((i=i.apply(t,e||[])).next())}))};const l={name:null,url:null,authorizationEndpoint:null,scope:null,scopePrefix:null,scopeDelimiter:null,redirectUri:null,requiredUrlParams:null,defaultUrlParams:null,oauthType:"1.0",popupOptions:void 0};class h{constructor(t,e,o,i){this.$http=t,this.storage=e,this.providerConfig=Object.assign(Object.assign({},l),o),this.options=i}init(t){return u(this,void 0,void 0,(function*(){return this.oauthPopup=new p("about:blank",this.providerConfig.name,this.providerConfig.popupOptions),window&&this.oauthPopup.open(this.providerConfig.redirectUri,!0),this.getRequestToken().then((e=>u(this,void 0,void 0,(function*(){const o=this.openPopup(e),i=this.exchangeForToken(o,t);return console.log("token",i),i}))))}))}getRequestToken(){return u(this,void 0,void 0,(function*(){const t={method:"POST"};return t[this.options.requestDataKey]=Object.assign({},this.providerConfig),t.withCredentials=this.options.withCredentials,this.options.baseUrl?t.url=i(this.options.baseUrl,this.providerConfig.url):t.url=this.providerConfig.url,console.log("requestOptions",t),this.$http(t)}))}openPopup(t){const e=t;console.log("openPopup",e);const o=e[this.options.responseDataKey],i=[this.providerConfig.authorizationEndpoint,this.buildQueryString(o)].join("?"),n=this.oauthPopup;return n.popup.location=i,window?n.open(this.providerConfig.redirectUri,this.providerConfig.skipPooling):n.pooling(this.providerConfig.redirectUri)}exchangeForToken(t,e){const o=Object.assign(Object.assign({},e),t),n={method:"POST"};return n[this.options.requestDataKey]=o,n.withCredentials=this.options.withCredentials,this.options.baseUrl?n.url=i(this.options.baseUrl,this.providerConfig.url):n.url=this.providerConfig.url,this.$http(n)}buildQueryString(t){console.log("oauth1 params",t);const e=[];for(const o in t){const i=t[o];e.push(encodeURIComponent(o)+"="+encodeURIComponent(i))}return e.join("&")}}var d=function(t,e,o,i){return new(o||(o=Promise))((function(n,r){function s(t){try{p(i.next(t))}catch(t){r(t)}}function a(t){try{p(i.throw(t))}catch(t){r(t)}}function p(t){var e;t.done?n(t.value):(e=t.value,e instanceof o?e:new o((function(t){t(e)}))).then(s,a)}p((i=i.apply(t,e||[])).next())}))};const g={name:null,url:null,clientId:null,authorizationEndpoint:null,redirectUri:null,scope:null,scopePrefix:null,scopeDelimiter:null,state:null,requiredUrlParams:null,defaultUrlParams:["response_type","client_id","redirect_uri"],responseType:"code",responseParams:{code:"code",clientId:"clientId",redirectUri:"redirectUri"},oauthType:"2.0",popupOptions:{}};class m{constructor(t,e,o,i){this.$http=t,this.storage=e,this.providerConfig=Object.assign(Object.assign({},g),o),this.options=i}init(t){return d(this,void 0,void 0,(function*(){const e=this.providerConfig.name+"_state",o=this.providerConfig.state,i=this.providerConfig.state;"function"==typeof o?this.storage.setItem(e,o()):"string"==typeof i&&this.storage.setItem(e,i);const n=[this.providerConfig.authorizationEndpoint,this._stringifyRequestParams()].join("?");this.oauthPopup=new p(n,this.providerConfig.name,this.providerConfig.popupOptions);const r=this.oauthPopup;try{const o=r.open(this.providerConfig.redirectUri,this.providerConfig.skipPooling);if(o){const i=o;if("code"===this.providerConfig.responseType||!this.providerConfig.url)return o;if(i.state&&i.state!==this.storage.getItem(e))return new Error("State parameter value does not match original OAuth request state value");const n=yield this.exchangeForToken(o,t);return console.log("token2",n),n}console.log("Oauth",o)}catch(t){return new Error(t)}}))}exchangeForToken(t,e){return d(this,void 0,void 0,(function*(){const o=Object.assign({},e);for(const e in g.responseParams)switch(e){case"code":o[e]=t.code;break;case"clientId":o[e]=this.providerConfig.clientId;break;case"redirectUri":o[e]=this.providerConfig.redirectUri;break;default:o[e]=t[e]}let n;t.state&&(o.state=t.state),n=this.options.baseUrl?i(this.options.baseUrl,this.providerConfig.url):this.providerConfig.url;const r=yield this.$http.post(n,o,{withCredentials:this.options.withCredentials});return console.log("post",r),r}))}_stringifyRequestParams(){const t=[];return["defaultUrlParams","requiredUrlParams","optionalUrlParams"].forEach((e=>{this.providerConfig[e]&&Array.isArray(this.providerConfig[e])&&this.providerConfig[e].forEach((e=>{const o=e.replace(/([:\-_]+(.))/g,(function(t,e,o,i){return i?o.toUpperCase():o})),i=this.providerConfig[e];let n="function"==typeof i?i():this.providerConfig[o];if("redirect_uri"!==e||n){if("state"===e){const t=this.providerConfig.name+"_state";n=encodeURIComponent(this.storage.getItem(t))}"scope"===e&&Array.isArray(n)&&(n=n.join(this.providerConfig.scopeDelimiter),this.providerConfig.scopePrefix&&(n=[this.providerConfig.scopePrefix,n].join(this.providerConfig.scopeDelimiter))),t.push([e,n])}}))})),t.map((t=>t.join("="))).join("&")}}class f{constructor(t,e){t.interceptors.response.use((t=>{const e=t.data;return console.log("datadata",e),t})),Object.defineProperties(this,{$http:{get:()=>t},OverrideOptions:{get:()=>e},defaultOptions:{get:()=>o}})}authenticate(t,e,o={}){return i=this,n=void 0,s=function*(){const i=this.OverrideOptions.providers[t],n={provider:Object.assign(Object.assign({},e),i)},r=Object.assign(Object.assign({},this.defaultOptions),n);this.options=r,this.storage=function(t){switch(t.storageType){case"localStorage":try{return window.localStorage.setItem("testKey","test"),window.localStorage.removeItem("testKey"),new class{constructor(t){this.namespace=t||null}setItem(t,e){window.localStorage.setItem(this._getStorageKey(t),e)}getItem(t){return window.localStorage.getItem(this._getStorageKey(t))}removeItem(t){window.localStorage.removeItem(this._getStorageKey(t))}_getStorageKey(t){return this.namespace?[this.namespace,t].join("."):t}}(t.storageNamespace)}catch(t){}case"sessionStorage":try{return window.sessionStorage.setItem("testKey","test"),window.sessionStorage.removeItem("testKey"),new class{constructor(t){this.namespace=t||null}setItem(t,e){window.sessionStorage.setItem(this._getStorageKey(t),e)}getItem(t){return window.sessionStorage.getItem(this._getStorageKey(t))}removeItem(t){window.sessionStorage.removeItem(this._getStorageKey(t))}_getStorageKey(t){return this.namespace?[this.namespace,t].join("."):t}}(t.storageNamespace)}catch(t){}case"cookieStorage":return new class{constructor(t){const e={domain:window.location.hostname,expires:null,path:"/",secure:!1};this._defaultOptions=Object.assign(Object.assign({},e),t)}setItem(t,e){const o=a(t,e,Object.assign({},this._defaultOptions));this._setCookie(o)}getItem(t){const e=function(t){if(0===t.length)return{};const e={},o=new RegExp("\\s*;\\s*");return t.split(o).forEach((t=>{const[o,i]=t.split("="),n=decodeURIComponent(o),r=decodeURIComponent(i);e[n]=r})),e}(this._getCookie());return void 0!==e[t]?e[t]:null}removeItem(t){const e=Object.assign({},this._defaultOptions),o=a(t,"",Object.assign(Object.assign({},e),{expires:new Date(0)}));this._setCookie(o)}_getCookie(){return"undefined"==typeof document||void 0===document.cookie?"":document.cookie}_setCookie(t){document.cookie=t}}(t.cookieStorage);case"memoryStorage":default:return new class{constructor(t){this.namespace=t||null,this._storage={}}setItem(t,e){this._storage[this._getStorageKey(t)]=e}getItem(t){return this._storage[this._getStorageKey(t)]}removeItem(t){delete this._storage[this._getStorageKey(t)]}_getStorageKey(t){return this.namespace?[this.namespace,t].join("."):t}}(t.storageNamespace)}}(r);const s=r,p=s.provider,c=p;if(!s.bindRequestInterceptor||"function"!=typeof s.bindRequestInterceptor||!s.bindResponseInterceptor||"function"!=typeof s.bindResponseInterceptor)throw new Error("Both request and response interceptors must be functions");{const t={options:this.options,storage:this.storage,$http:this.$http,providerConfig:p};s.bindRequestInterceptor.call(this,t),s.bindResponseInterceptor.call(this,t)}if(!p)return new Error("Unknown provider");try{let t;switch(c.oauthType){case"1.0":console.log("providerConfig",p),t=new h(this.$http,this.storage,p,r);break;case"2.0":t=new m(this.$http,this.storage,p,r);break;default:return new Error("Invalid OAuth type")}return t.init(o).then((t=>t)).catch((t=>new Error(t)))}catch(t){return t}},new((r=void 0)||(r=Promise))((function(t,e){function o(t){try{p(s.next(t))}catch(t){e(t)}}function a(t){try{p(s.throw(t))}catch(t){e(t)}}function p(e){var i;e.done?t(e.value):(i=e.value,i instanceof r?i:new r((function(t){t(i)}))).then(o,a)}p((s=s.apply(i,n||[])).next())}));var i,n,r,s}}const w={facebook:{name:"facebook",url:"/auth/facebook",authorizationEndpoint:"https://www.facebook.com/v2.5/dialog/oauth",redirectUri:window.location.origin+"/",requiredUrlParams:["display","scope"],scope:["email"],scopeDelimiter:",",display:"popup",oauthType:"2.0",popupOptions:{width:580,height:400}},google:{name:"google",url:"/auth/google",authorizationEndpoint:"https://accounts.google.com/o/oauth2/auth",redirectUri:window.location.origin,requiredUrlParams:["scope"],optionalUrlParams:["display"],scope:["profile","email"],scopePrefix:"openid",scopeDelimiter:" ",display:"popup",oauthType:"2.0",popupOptions:{width:452,height:633}},github:{name:"github",url:"/auth/github",authorizationEndpoint:"https://github.com/login/oauth/authorize",redirectUri:window.location.origin,optionalUrlParams:["scope"],scope:["user:email"],scopeDelimiter:" ",oauthType:"2.0",popupOptions:{width:1020,height:618}},instagram:{name:"instagram",url:"/auth/instagram",authorizationEndpoint:"https://api.instagram.com/oauth/authorize",redirectUri:window.location.origin,requiredUrlParams:["scope"],scope:["basic"],scopeDelimiter:"+",oauthType:"2.0",popupOptions:{width:null,height:null}},twitter:{name:"twitter",url:"/auth/twitter",authorizationEndpoint:"https://api.twitter.com/oauth/authenticate",redirectUri:window.location.origin,oauthType:"1.0",popupOptions:{width:495,height:645}},bitbucket:{name:"bitbucket",url:"/auth/bitbucket",authorizationEndpoint:"https://bitbucket.org/site/oauth2/authorize",redirectUri:window.location.origin+"/",optionalUrlParams:["scope"],scope:["email"],scopeDelimiter:" ",oauthType:"2.0",popupOptions:{width:1020,height:618}},linkedin:{name:"linkedin",url:"/auth/linkedin",authorizationEndpoint:"https://www.linkedin.com/oauth/v2/authorization",redirectUri:window.location.origin,requiredUrlParams:["state","scope"],scope:["r_emailaddress"],scopeDelimiter:" ",state:"STATE",oauthType:"2.0",popupOptions:{width:527,height:582}},vkontakte:{name:"vkontakte",url:"/auth/vkontakte",authorizationEndpoint:"https://oauth.vk.com/authorize",redirectUri:window.location.origin+"/",requiredUrlParams:["scope"],scope:["email"],scopeDelimiter:",",display:"popup",oauthType:"2.0",popupOptions:{width:580,height:400}},live:{name:"live",url:"/auth/live",authorizationEndpoint:"https://login.live.com/oauth20_authorize.srf",redirectUri:window.location.origin,requiredUrlParams:["display","scope"],scope:["wl.emails"],scopeDelimiter:" ",display:"popup",oauthType:"2.0",popupOptions:{width:500,height:560}},oauth1:{name:null,url:"/auth/oauth1",authorizationEndpoint:null,redirectUri:window.location.origin,oauthType:"1.0",popupOptions:null},oauth2:{name:null,url:"/auth/oauth2",clientId:null,redirectUri:window.location.origin,authorizationEndpoint:null,defaultUrlParams:["response_type","client_id","redirect_uri"],requiredUrlParams:null,optionalUrlParams:null,scope:null,scopePrefix:null,scopeDelimiter:null,state:null,oauthType:"2.0",popupOptions:null,responseType:"code",responseParams:{code:"code",clientId:"clientId",redirectUri:"redirectUri"}}},v=w.facebook,y=w.google,b=w.github,U=w.instagram,O=w.twitter,k=w.bitbucket,C=w.linkedin,I=w.vkontakte,P=w.live,S=w.oauth1,j=w.oauth2,_=f;return e})()}));