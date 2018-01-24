# Simple Message Queue Server

This is a message queue server that supports multiple producers and consumers.

## Characteristics

- Store messages in-memory
- Messages are non-persistent
- Multiple queues, producers and consumers
- Each consumer receives different messages
- The ack is about numbers, not messages *(read more below)*
- Has its own protocol *(read more below)*
- Single node only

## Acknowledgement

On an usual queue server, you acknowledge the **message**. On this server, you acknowledge the **number of messages**. While the consumer is connected to the server it will distribute the messages between all the consumers, without caring if the consumer already finished to process the delivered messages. This is useful to process batch data (like inserting users in a database with multi-insert) controlling the input amount (like waiting the process to finish before loading more users from the datasource).

```
const client = require('client')

client.connect()
client.done(1000) // Here you pass the number of messages done
```

## Protocol

You can use any TCP client to connect with this server. One connection can be a consumer and a producer, but if it's a consumer it can't be a stats collector and vice versa.

### Producers

To send messages to the queue, you send a buffer in this format:

```
M:<queue name>:<json encoded data>\n

Ex: M:users:{"id":1,"name":"Vagner"}\n // Don't forget the line break
```

### Consumers

To start receiving messages from the server, you need to set the connection as a consumer:

```
C:<queue name>

Ex: C:users
```

After that the server will start sending messagesas json encoded:

```
{"id":1,"name":"Vagner"}\n
```

### Setting the number of processed messages

To set that a number of messages has been processed, you need to send a buffer in this format:

```
D:users:1000 // It sets that 1000 messages has been processed.
```

### Stats collector

To get the number of missing messages to be delivered/processed, you need send a buffer in this format:

```
S
```

After that the server will send the current statistics of the queues:

```
{"users":2134} // It means that the `users` queue have 2134 missing messages
```

*Note that you have to send the comment every time you want the statistics.*
