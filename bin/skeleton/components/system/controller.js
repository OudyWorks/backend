

export default class Controller {

    static async beforeInitiate(application, request, response) {



    }

    static async beforeLoad(application, request, response, route, payload) {



    }

    static async afterLoad(application, request, response, route, payload) {

        if(payload.constructor.name == 'Object') {

            

        }

    }

}