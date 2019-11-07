import middleware from './middleware'

export default function ({
    path = '/static',
    root = './',
    options
}) {
    return async function StaticComponent(application) {
        application.ready.then(
            async () => {
                application.router.use(
                    path,
                    middleware(
                        root,
                        options
                    )
                )
            }
        )
    }
}