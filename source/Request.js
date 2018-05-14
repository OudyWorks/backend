import URL from 'url'
import qs from 'qs'
import cookie from 'cookie'
import multipart from 'parse-multipart'
import {unsign} from 'cookie-signature'
import Server from './Server'
import accepts from 'accepts'

export default class Request {
    constructor(request, socket = false) {
        this.id = ''
        this.parseURL(request.url)
        this.method = request.method
        this.headers = request.headers
        this.cookies = {}
        if (this.headers.cookie)
            this.cookies = cookie.parse(this.headers.cookie)

        Object.keys(this.cookies).forEach(
            key => {
                if(this.cookies[key].match(/^s:/))
                    this.cookies[key] = unsign(this.cookies[key].replace(/^s:/, ''), Server.cookieSignature) || this.cookies[key]
                if(this.cookies[key].match(/^j:/))
                    this.cookies[key] = JSON.parse(this.cookies[key].replace(/^j:/, ''))
            }
        )

        this.ip = this.headers['x-forwarded-for'] || request.connection.remoteAddress
        this.body = null
        this.bodyObject = {}
        this.files = []
        this.socket = socket

        this.accepts = accepts(request)

    }
    parseURL(url) {
        url = URL.parse(url, true)
        this.url = url.path
        this.path = url.pathname
        this.query = (url.search || '').replace(/^\?/, '')
        this.files = []
        this.pathArray = (url.pathname || '').replace(/^\//, '').split('/')
        this.queryObject = url.query
    }
    parseBody(body, type = '') {
        this.body = body
        let typeArray = type.trim().split(';')
        switch (typeArray[0]) {
            case 'application/json':
            case 'json':
                try {
                    this.bodyObject = JSON.parse(body.toString())
                } catch(e) {
                    this.bodyObject = {}
                }
                break
            case 'object':
                Object.assign(this.bodyObject, body)
                break
            case 'multipart/form-data':
                try {
                    let boundary = multipart.getBoundary(type)
                    this.files = multipart.Parse(body, boundary)
                } catch (e) {
                    this.files = []
                }
                break
            case 'application/x-www-form-urlencoded':
            default:
                this.bodyObject = qs.parse(body.toString())
                break
        }
    }
    append(request) {
        this.method = request.method || 'GET'
        this.id = request.id || ''
        this.parseURL(request.url)
        this.parseBody(request.data || {}, 'object')
    }

    isInPath(component) {
        return this.pathArray.includes(component.toString())
    }
    nextInPath(component) {
        let index
        if ((index = this.pathArray.indexOf(component.toString())) !== -1)
            if (typeof this.pathArray[++index] !== 'undefined')
                return this.pathArray[index]
        return undefined
    }

    isInPOST(key) {
        return typeof this.bodyObject[key] !== 'undefined'
    }

    getPOST(key) {
        return this.isInPOST(key) ? this.bodyObject[key] : undefined
    }

    isInGET(key) {
        return typeof this.queryObject[key] !== 'undefined'
    }

    getGET(key) {
        return this.isInGET(key) ? this.queryObject[key] : undefined
    }

    static parse(request) {

        return new Promise(
            resolve => {

                let body = []

                request.on(
                    'data',
                    chunk =>
                        body.push(chunk)
                )

                request.on('end', () => {

                    request = new Request(request)

                    request.parseBody(Buffer.concat(body), request.headers['content-type'])

                    resolve(request)

                })

            }
        )

    }

}