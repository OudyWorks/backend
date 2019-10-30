import MongoDB from '@oudy/mongodb'

MongoDB.ready = MongoDB.configure(
    'test',
    'mongodb://localhost:32768',
    {
        useUnifiedTopology: true
    }
)

export * from '@oudy/mongodb'
export default MongoDB