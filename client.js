const net = require('net')
const JsonSocket = require('json-socket')

const socket = new JsonSocket(new net.Socket())

let statsEventHandler = false

const connect = host => {
    socket.connect(2201, host || '127.0.0.1')

    socket.on('error', e => {
        console.log(e)
    })

    socket.on('close', () => {
        throw new Error('Connection closed')
    })

    socket.on('connect', () => {
        console.log('Connected')
    })
}

const send = (type, queue = '', data = '') => {
    socket.sendMessage({ type, queue, data })
}

const publish = (queue, data) => {
    send('M', queue, data)
}

const consume = (queue, callback) => {
    send('C', queue)
    socket.on('message', callback)
}

const done = (queue, number) => {
    send('D', queue, number)
}

const stats = callback => {
    send('S')

    if (statsEventHandler) return
    statsEventHandler = true

    socket.on('message', callback)
}

module.exports = {
    connect,
    publish,
    consume,
    done,
    stats
}
