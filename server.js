const net = require('net')
const JsonSocket = require('json-socket')

const consumers = {}
const bufferedMessages = {}

let consumerIndex = 0

const sendMessageToConsumer = (queue, message) => {
    if (consumerIndex < consumers[queue].length - 1) {
        consumerIndex++
    } else {
        consumerIndex = 0
    }

    consumers[queue][consumerIndex].messages++
    consumers[queue][consumerIndex].sendMessage(message)
}

const server = net.createServer(socket => {
    socket = new JsonSocket(socket)

    socket.on('message', message => {
        const { type, queue, data } = message

        switch (type) {
            case 'M':
                if (!consumers[queue] || consumers[queue].length == 0) {
                    if (!bufferedMessages[queue]) {
                        bufferedMessages[queue] = []
                    }

                    bufferedMessages[queue].push(data)

                    break
                }

                sendMessageToConsumer(queue, data)

                break
            case 'C':
                socket.isConsumer = true
                socket.queue = queue
                socket.messages = 0

                if (!consumers[queue]) {
                    consumers[queue] = []
                }

                consumers[queue].push(socket)

                if (bufferedMessages[queue]) {
                    while (bufferedMessages[queue].length > 0) {
                        sendMessageToConsumer(queue, bufferedMessages[queue].shift())
                    }
                }

                break
            case 'D':
                socket.messages -= parseInt(data)

                break
            case 'S':
                if (Object.keys(consumers).length == 0 && Object.keys(bufferedMessages).length == 0) {
                    socket.sendMessage('')
                    break
                }

                const counts = {}

                for (const queue in consumers) {
                    if (!counts[queue]) {
                        counts[queue] = 0
                    }

                    for (const consumer of consumers[queue]) {
                        counts[queue] += consumer.messages
                    }
                }

                for (const queue in bufferedMessages) {
                    if (!counts[queue]) {
                        counts[queue] = 0
                    }

                    counts[queue] += bufferedMessages[queue].length
                }

                socket.sendMessage(counts)

                break
            default:
                socket.sendMessage('UNKNOWN_TYPE')
                break
        }
    })

    socket.on('error', e => {
        consumers[socket.queue].splice(consumers[socket.queue].indexOf(socket), 1)
    })

    socket.on('end', () => {
        if (socket.isConsumer) {
            consumers[socket.queue].splice(consumers[socket.queue].indexOf(socket), 1)
        }
    })
})

server.listen(2201, '0.0.0.0')
