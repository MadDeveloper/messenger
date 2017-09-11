const server = require('http').createServer()
const io = require('socket.io')(server)
const uniqid = require('uniqid')
const config = {
    port: 3000
}
let clients = []

io.on('connection', client => {
    // member has initialized a new socket connection
    client.id = uniqid()
    clients.push(client)

    // emit id to the client
    client.emit('info connection', {
        id: client.id
    })

    // new member sent connection event
    client.on('connection', data => {
        client.username = data.username
        sendEvent('member connect', { username: client.username }, allExceptOne(client, clients))
    })

    // member sent a message
    client.on('send', data => sendEvent('message', {
        username: client.username,
        message: data.message
    }, clients))

    // member has left the room
    client.on('disconnect', () => sendEvent('member disconnect', { username: client.username }, allExceptOne(client, clients)))
})

function allExceptOne(client, clients) {
    return clients.filter(current => current.id !== client.id)
}

function sendEvent(event, data, clients) {
    clients.forEach(client => client.emit(event, data))
}

server.listen(config.port, () => console.log('Server started'))