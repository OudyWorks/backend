import {
  extend
} from '@oudy/drivers/interface'
import Client from './client'

class BackendClient extends extend(Client) {
  static configureFor() {
    // get the arguments as Array
    const args = Array.from(arguments),
      // get name of connection from the first argument
      name = args.shift(),
      // url and options
      [url, websocket] = args,
      // connect
      connection = new Client(url, websocket)

    return Promise.resolve(
      super.configureFor(name, connection)
    )
  }
}
export default BackendClient