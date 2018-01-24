const client = require('../client')

client.connect()

setInterval(() => {
    client.stats(console.log)
}, 1000)
