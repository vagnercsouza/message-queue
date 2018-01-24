const client = require('../client')

client.connect()

let buffer = []

client.consume('test', message => {
    buffer.push(message)

    if (buffer.length === 1000) {
        buffer = []
        client.done('test', 1000)
    }
})
