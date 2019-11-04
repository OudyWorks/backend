import middleware from './middleware'

export default function ({
    path = '/static',
    root = './',
    options
}) {
    return function (application) {
        return application.ready.then(
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