const net = require('net')
const client = net.Socket()

let statsEventHandler = false

const connect = host => {
    client.connect(2201, host || '127.0.0.1')

    client.on('error', e => {
        console.log(e)
    })

    client.on('close', () => {
        throw new Error('Connection closed')
    })
}

const send = (type, queue = '', message = '') => {
    client.write(`${type}:${queue}:${message}` + "\n")
}

const publish = (queue, message) => {
    send('M', queue, JSON.stringify(message))
}

const consume = (queue, callback) => {
    send('C', queue)

    client.on('data', data => {
        const messages = data.toString().split("\n").filter(m => m != '')

        for (const message of messages) {
            try {
                callback(JSON.parse(message))
            } catch (e) {
                console.log(e.message)
                console.log(message)
            }
        }
    })
}

const done = (queue, number) => {
    send('D', queue, number.toString())
}

const stats = callback => {
    send('S')

    if (statsEventHandler) return
    statsEventHandler = true

    client.on('data', data => callback(JSON.parse(data.toString())))
}

module.exports = {
    connect,
    publish,
    consume,
    done,
    stats
}
