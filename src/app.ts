import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
// import cors from 'cors'

const app = express()
// app.use(cors())

const httpServer = createServer(app)
// const socket = socketio(httpServer)

const messages: any[] = [
  { message: 'Hello, Viktor', id: 'hsdafgds', user: { id: 'sdfdsf', name: 'Dimych' } },
  { message: 'Hello, Dimych', id: 'asdfsdfs', user: { id: 'asdfdg', name: 'Viktor' } },
]

const socket = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

const usersState = new Map()

app.get('/', (_req, res) => {
  res.send("Hello, it's WS server")
})

socket.on('connection', (socketChannel: any) => {
  console.log('New user connected:', socketChannel.id)

  usersState.set(socketChannel, {
    id: new Date().getTime().toString(),
    name: 'Anonymous',
  })

  socketChannel.on('client-name-sent', (name: string) => {
    if (typeof name !== 'string') {
      return
    }

    const user = usersState.get(socketChannel)
    user.name = name
  })

  socketChannel.on('client-message-sent', (message: string) => {
    if (typeof message !== 'string') {
      return
    }

    const user = usersState.get(socketChannel)

    const newMessage = {
      message: message,
      id: new Date().getTime().toString(),
      user: {
        id: user.id,
        name: user.name,
      },
    }
    messages.push(newMessage)

    socket.emit('new-message-sent', newMessage)
  })

  socketChannel.emit('init-messages-published', messages)

  console.log('a user connected')
})

const PORT = process.env.PORT || 3009

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
