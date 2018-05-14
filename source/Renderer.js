import {
    Readable
} from 'stream'
import booleanify from 'booleanify'

class Renderer {
    static async render(application, request, response, route, payload) {

        if(response.finished)
            return null

        if(typeof payload.pipe === 'function')
            return payload

        let readable = new Readable(),
            suppress = booleanify(request.getGET('suppress')),
            pretty = booleanify(request.getGET('pretty'))

        if (suppress)
            response.statusCode = 200

        if(typeof payload == 'object')
            payload = JSON.stringify(payload, null, pretty ? 4 : 0)

        readable._read = function noop() {}
        readable.push(payload)
        readable.push(null)

        return readable

    }
}

export default Renderer