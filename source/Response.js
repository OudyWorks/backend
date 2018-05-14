import merge from 'utils-merge'
import cookie from 'cookie'
import {sign} from 'cookie-signature'
import Server from './Server'

export default class Response {
    static wrap(response) {

        Object.assign(
            response,
            {
                appendHeader(field, value) {
                    let prev = this.getHeader(field)

                    if(prev)
                        value = Array.isArray(prev) ? prev.concat(value)
                                : Array.isArray(value) ? [value].concat(value)
                                : [prev, value]

                    this.setHeader(field, value)
                },
                setCookie(key, value, options = {}) {

                    options = merge(merge({}, Server.cookieOptions), options)

                    value = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

                    if(options.signed && Server.cookieSignature)
                        value = 's:'+sign(value, Server.cookieSignature)

                    this.appendHeader('Set-Cookie', cookie.serialize(key, value, options))

                },
                clearCookie(key, options = {}) {
                    options.expires = new Date(1)
                    this.setCookie(key, '', options)
                }
            }
        )

        return response

    }
}