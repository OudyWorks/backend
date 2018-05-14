import http from 'http'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import {Server as Websocket} from 'ws'
import Request from './Request'
import Response from './Response'
import Application from './Application'

class Server {
    constructor() {
        this.http = http.createServer()
        this.websocket = new Websocket({
            server: this.http
        })
        this.http.on(
            'request',
            (request, response) =>
                this.request(request, response)
        )
        this.websocket.on(
            'connection',
            (request, response) =>
                this.request(request, response, true)
        )
    }
    async request(request, response, socket = false) {

        return Request.parse(request).then(
            request => {

                response = Response.wrap(response)

                let application = new this.constructor.Application(socket)

                return this.process(application, request, response)

            }
        )

    }
    async process(application, request, response) {

        await application.initiate(request, response)

        let route = await application.route(request, response)

        let payload = await application.load(request, response, route)

        application.render(request, response, route, payload).then(
            body =>
                !response.finished && body.pipe(response)
        )

    }
    listen(port = 80, hostname = '127.0.0.1') {
        this.http.listen(port, hostname)
    }
}

Server.cookieSignature = undefined
Server.cookieOptions = {
    path: '/'
}

Server.Application = Application

export default Server