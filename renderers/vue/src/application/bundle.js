import Vue from 'vue'
import App from '@app'

export default context =>
    new Promise(
        (resolve, reject) => {
            const {
                app,
                router,
                store
            } = App(context)

            if (store)
                if (context.state)
                    store.replaceState(context.state)
            if (router) {
                router.push(context.request.path)
                router.onReady(() => {
                    const matchedComponents = router.getMatchedComponents()
                    if (!matchedComponents.length) {
                        return reject({
                            code: 404
                        })
                    }
                    context.meta = app.$meta()
                    resolve(app)
                }, reject)
            } else {
                context.meta = app.$meta()
                resolve(app)
            }
        }
    )