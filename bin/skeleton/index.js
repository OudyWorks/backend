import {
    Server,
    Application
} from '@oudyworks/backend'

const server = new Server()

Promise.all([
    Application.start(__dirname)
]).then(
    () => {

        server.listen(8080, '127.0.0.1')

        console.log('Server Started!')

    }
)