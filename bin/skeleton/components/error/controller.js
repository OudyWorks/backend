


class Controller {

    static async run(application, request, response, route, payload) {

        response.statusCode = 404
        payload.error = 'Page not found!'

        // return payload

    }

}

Controller.route = {
    // If no route matched within 1s, then use the Error
    url: {
        test(url) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(/.*/.test(url))
                }, 100)
            })
        }
    },
    code: 404,
    allowed: true
}

export default Controller