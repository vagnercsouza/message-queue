const net = require('net')

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
    consumers[queue][consumerIndex].write(message)
}

const server = net.createServer(socket => {
    socket.on('data', data => {
        const messages = data.toString().split("\n")

        for (const message of messages) {
            const parts = message.split(':', 2)

            if (parts.length < 2) return

            const type = parts[0]
            const queue = parts[1]

            switch (type) {
                case 'M':
                    const content = message.substr(type.length + queue.length + 2)

                    if (!consumers[queue] || consumers[queue].length == 0) {
                        if (!bufferedMessages[queue]) {
                            bufferedMessages[queue] = []
                        }

                        bufferedMessages[queue].push(content)

                        break
                    }

                    sendMessageToConsumer(queue, content + "\n")

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
                            sendMessageToConsumer(queue, bufferedMessages[queue].shift() + "\n")
                        }
                    }

                    break
                case 'D':
                    const messagesDone = parseInt(message.substr(type.length + queue.length + 2))
                    socket.messages -= messagesDone

                    break
                case 'S':
                    if (Object.keys(consumers).length == 0 && Object.keys(bufferedMessages).length == 0) {
                        socket.write(JSON.stringify({}) + "\n")
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

                    socket.write(JSON.stringify(counts) + "\n")

                    break
                default:
                    socket.write('UNKNOWN_TYPE' + "\n")
                    break
            }
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
