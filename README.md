# Simple Message Queue Server

This is a message queue server that supports multiple producers and consumers.

## Characteristics

- Store messages in-memory
- Messages are non-persistent
- Multiple queues, producers and consumers
- Each consumer receives different messages
- The ack is about numbers, not messages *(read more below)*
- Single node only

## Acknowledgement

On an usual queue server, you acknowledge the **message**. On this server, you acknowledge the **number of messages**. While the consumer is connected to the server it will distribute the messages between all the consumers, without caring if the consumer already finished to process the delivered messages. This is useful to process batch data (like inserting users in a database with multi-insert) controlling the input amount (like waiting the process to finish before loading more users from the datasource).

```
const client = require('client')

client.connect()
client.done(1000) // Here you pass the number of messages done
```

## Examples

### Producers

To send messages to the queue use the `publish` function:

```
const client = require('client')

client.connect()
client.publish('users', {id: 10})
```

### Consumers

To start receiving messages from the server use the `consume` function:

```
const client = require('client')

client.connect()
client.consume('users', user => {
    console.log(user) // {id: 10}
})
```

### Setting the number of processed messages

To set that a number of messages has been processed use the `done` function.

```
const client = require('client')

client.connect()
client.done(1000) // Here you pass the number of messages done
```

### Stats collector

To get the number of missing messages to be delivered/processed use the `stats` function:

```
const client = require('client')

client.connect()
client.stats(stats => {
    console.log(stats) // {"users":2134} means that the `users` queue have 2134 missing messages
})
```
