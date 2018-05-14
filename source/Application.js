import recursiveReadSync from 'recursive-readdir-sync'
import Renderer from './Renderer'

const componentRegex = /components\/([0-9a-zA-Z.]+)(\/tasks\/([0-9a-zA-Z.]+))?\/controller\.js$/,
    moduleRegex = /modules\/([0-9a-zA-Z.]+)\/controller\.js$/,
    triggers = [
        'beforeInitiate',
        'initiate',
        'afterInitiate',
        'beforeRoute',
        'afterRoute',
        'beforeLoad',
        'afterLoad'
    ],
    routes = [
        'route',
        'routes'
    ],
    loadRoutesAndTriggers = (Application, Controller, component, task) => {
        routes.forEach(trigger => {
            if (Controller[trigger])
                if (Array.isArray(Controller[trigger]))
                    Controller[trigger].forEach(route => {
                        Application.routes.push({
                            component,
                            task,
                            ...route
                        })
                    })
                else
                    Application.routes.push({
                        component,
                        task,
                        ...Controller[trigger]
                    })
        })
        triggers.forEach(trigger => {
            if (Controller[trigger])
                if (Array.isArray(Controller[trigger]))
                    Controller[trigger].forEach(callback => {
                        Application.triggers[trigger].push(callback)
                    })
                else
                    Application.triggers[trigger].push(Controller[trigger])
        })
    },
    trigger = (Application, event, params) => {
        return Promise.all(
            Application.triggers[event].map(
                e =>
                    e(...params)
            )
        )
    }

class Application {

    constructor(socket = false) {

        this.socket = socket

    }

    async initiate(request, response) {
        return trigger(this.constructor, 'beforeInitiate', [this, request, response])
        .then(
            () =>
                trigger(this.constructor, 'initiate', [this, request, response])
        ).then(
            () =>
                trigger(this.constructor, 'afterInitiate', [this, request, response])
        )
    }

    async route(request, response) {
        return trigger(this.constructor, 'beforeRoute', [this, request, response]).then(
            () =>
                Promise.race(
                    this.constructor.routes.map(
                        route =>
                            new Promise(
                                resolve =>
                                    Promise.resolve(route.url.test(request.path)).then(
                                        isMatched =>
                                            isMatched && resolve(route)
                                    )
                            )
                    )
                )
            ).then(
                route =>
                    trigger(this.constructor, 'afterRoute', [this, request, response, route]) && route
            )
    }

    async load(request, response, route) {

        let payload = {
            test: 'Hello'
        }

        return trigger(this.constructor, 'beforeLoad', [this, request, response, route, payload]).then(
            () =>
                this.constructor.components[route.component][route.task].run(this, request, response, route, payload).then(
                    returnedPayload =>
                        returnedPayload || payload
                )
            ).then(
                payload =>
                    trigger(this.constructor, 'afterLoad', [this, request, response, route, payload]) && payload
            )
    }

    async render(request, response, route, payload) {

        if(typeof payload.pipe === 'function')
            return payload

        return this.constructor.Renderer.render(this, request, response, route, payload)

    }

    static start(directory) {

        let files = recursiveReadSync(directory)

        files.forEach(
            file => {

                if(file.match(componentRegex)) {

                    let [,component,,task = 'default'] = file.match(componentRegex)

                    if(!this.components[component])
                        this.components[component] = {}

                    try {

                        this.components[component][task] = require(file).default

                        if(!this.components[component][task])
                            throw 'Undefined'

                        loadRoutesAndTriggers(this, this.components[component][task], component, task)

                    } catch(error) {

                        delete this.components[component][task]

                        console.log(`Something is wrong ig ${component}.${task}'s Controller`)
                        console.log(error)

                    }

                }

                if(file.match(moduleRegex)) {

                    let [,module] = file.match(moduleRegex)

                    try {

                        this.modules[module] = require(file).default

                    } catch(error) {

                        console.log(`Something is wrong ig ${module}'s module`)

                    }

                }

            }
        )

    }

}

Application.components = {}
Application.modules = {}

Application.routes = []
Application.triggers = {}

triggers.forEach(trigger => {
    Application.triggers[trigger] = []
})

Application.Renderer = Renderer

export default Application