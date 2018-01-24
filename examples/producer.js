const client = require('../client')

client.connect()

setInterval(() => {
    client.publish('test', { date: new Date() })
}, 0)
