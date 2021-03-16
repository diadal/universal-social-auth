/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import Promise from '../promise'

import { parseQueryString, getFullUrlPath, isUndefined } from '../utils'
// import { oAuth } from './oauth2'

export default class OAuthPopup {
  popupOptions: Record<string, string | undefined>
  popup: any
  url: string
  name: string
  constructor (url: string, name: string, popupOptions: Record<string, string| undefined>) {
    this.popup = null
    this.url = url
    this.name = name
    this.popupOptions = popupOptions
  }

  open (redirectUri: string, skipPooling: boolean) {
    try {
      // this.popup = window.open(this.url, this.name, this._stringifyOptions())
      this.popup = window.open(this.url, this.name, this._stringifyOptions())
      if (this.popup && this.popup.focus) {
        this.popup.focus()
      }

      if (skipPooling) {
        return Promise.resolve()
      } else {
        const pool = this.pooling(redirectUri)
        console.log('pool', pool)
        return pool
      }
    } catch (e) {
      return Promise.reject(new Error('OAuth popup error occurred'))
    }
  }
  // open (redirectUri: string, skipPooling: boolean) {
  //   try {
  //     this.popup = window.open(this.url, this.name, this._stringifyOptions())
  //     if (this.popup && this.popup.focus) {
  //       this.popup.focus()
  //     }

  //     if (skipPooling) {
  //       return Promise.resolve(null)
  //     } else {
  //       return this.pooling(redirectUri)
  //     }
  //   } catch (e) {
  //     return Promise.reject(new Error('OAuth popup error occurred'))
  //   }
  // }

  pooling (redirectUri: string) {
    return new Promise((resolve:any) => {
      const redirectUriParser = document.createElement('a')
      redirectUriParser.href = redirectUri
      const redirectUriPath = getFullUrlPath(redirectUriParser)

      let poolingInterval = window.setInterval(() => {
        if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
          clearInterval(poolingInterval)
          poolingInterval = 0
          reject(new Error('Auth popup window closed'))
        }
        // console.log('this.popup.location.href', this.popup.location.href)
        // alert(this.popup.location.href)

        try {
          const location = this.popup

          const popupWindowPath = getFullUrlPath(location.location)
          console.log('location.location', location.location)

          console.log('redirectUriPath', redirectUriPath)

          if (popupWindowPath === redirectUriPath) {
            if (location.location.search || location.location.hash) {
              const query = parseQueryString(location.location.search.substring(1).replace(/\/$/, ''))
              const hash = parseQueryString(location.location.hash.substring(1).replace(/[/$]/, ''))
              const params = {
                ...query,
                ...hash
              }
              // params = objectExtend(params, )

              if (params.error) {
                reject(new Error((<string>params.error)))
              } else {
                resolve(params)
              }
            } else {
              reject(new Error('OAuth redirect has occurred but no query or hash parameters were found.'))
            }

            clearInterval(poolingInterval)
            poolingInterval = 0
            location.close()
          }
        } catch (e) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        }
      }, 250)
    })
  }

  // pooling (redirectUri: string) {
  //   // console.log('redirectUri', redirectUri)
  //   try {
  //     const redirectUriParser = document.createElement('a')
  //     redirectUriParser.href = redirectUri
  //     const redirectUriPath = getFullUrlPath(redirectUriParser)
  //     console.log('redirectUriPath', redirectUriPath)

  //     let poolingInterval = window.setInterval(() => {
  //       if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
  //         clearInterval(poolingInterval)
  //         poolingInterval = 0
  //         return (new Error('Auth popup window closed'))
  //       }

  //       try {
  //         const location = this.popup
  //         console.log('location', location.location)
  //         const popupWindowPath = getFullUrlPath(location.location)
  //         console.log('popupWindowPath', popupWindowPath)
  //         console.log('redirectUriPath', redirectUriPath)
  //         if (popupWindowPath === redirectUriPath) {
  //           if (location.location.search || location.location.hash) {
  //             const query = parseQueryString(location.location.search.substring(1).replace(/\/$/, ''))
  //             const hash = parseQueryString(location.location.hash.substring(1).replace(/[/$]/, ''))
  //             const params = {
  //               ...query,
  //               ...hash
  //             }
  //             // let params = objectExtend({}, query)
  //             console.log('query', query)
  //             console.log('hash', hash)
  //             // params = objectExtend(params, hash)

  //             if (params.error) {
  //               const err = params.error
  //               clearInterval(poolingInterval)
  //               poolingInterval = 0
  //               location.close()
  //               return (new Error(<string>err))
  //             } else {
  //               clearInterval(poolingInterval)
  //               poolingInterval = 0
  //               location.close()
  //               return (params)
  //             }
  //           } else {
  //             clearInterval(poolingInterval)
  //             poolingInterval = 0
  //             location.close()
  //             return (new Error('OAuth redirect has occurred but no query or hash parameters were found.'))
  //           }

  //           // clearInterval(poolingInterval)
  //           // poolingInterval = 0
  //           // location.close()
  //         }
  //       } catch (e) {
  //         return (new Error(e))
  //       }
  //     }, 1000)
  //   } catch (error) {
  //     return (new Error(error))
  //   }
  // }

  _stringifyOptions () {
    const options:string[] = []
    const Popup = this.popupOptions
    console.log('Popup', Popup)
    for (const optionKey in Popup) {
      if (!isUndefined(<undefined>(Popup[optionKey]))) {
        options.push(`${optionKey}=${<string>(Popup[optionKey])}`)
      }
    }
    return options.join(',')
  }
}

function reject (arg0: Error) {
  throw new Error('Function not implemented.')
}
// function reject (arg0: Error) {
//   throw new Error('Function not implemented.')
// }
