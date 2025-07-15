import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { randomUUID } from 'node:crypto'

const app = express()

const httpServer = createServer(app)

const EVENTS = {
  INIT_MESSAGES: 'init-messages-published',
  NEW_MESSAGE: 'new-message-sent',
  USER_TYPING: 'user-typing',
  USER_STOP_TYPING: 'user-stopped-typing',
  USERS_COUNT_UPDATING: 'users-count-updated',
  DISCONNECT: 'disconnect',
  CLIENT_NAME_SENT: 'client-name-sent',
  CLIENT_MESSAGE_SENT: 'client-message-sent',
  CLIENT_TYPED: 'client-typed',
  CLIENT_STOPPED_TYPING: 'client-stopped-typing',
} as const

const messages: any[] = [
  {
    message: 'Hello, Viktor!',
    id: randomUUID(),
    createdAt: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    user: { id: randomUUID(), name: 'Dimych' },
  },
  {
    message: 'Hello, Dimych!',
    id: randomUUID(),
    createdAt: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    user: { id: randomUUID(), name: 'Viktor' },
  },
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
    id: randomUUID(),
    name: 'Anonymous',
  })

  updateUsersCount()

  socketChannel.on(EVENTS.DISCONNECT, () => {
    const user = usersState.get(socketChannel)
    if (user) {
      socketChannel.broadcast.emit(EVENTS.USER_STOP_TYPING, user)
      usersState.delete(socketChannel)
      updateUsersCount()
    }
  })

  socketChannel.on(EVENTS.CLIENT_NAME_SENT, (name: string) => {
    if (typeof name !== 'string') {
      return
    }

    const user = usersState.get(socketChannel)
    user.name = name
  })

  socketChannel.on(EVENTS.CLIENT_TYPED, () => {
    const user = usersState.get(socketChannel)
    if (user) {
      socketChannel.broadcast.emit(EVENTS.USER_TYPING, user)
    }
  })

  socketChannel.on(EVENTS.CLIENT_STOPPED_TYPING, () => {
    const user = usersState.get(socketChannel)
    if (user) {
      socketChannel.broadcast.emit(EVENTS.USER_STOP_TYPING, user)
    }
  })

  socketChannel.on(EVENTS.CLIENT_MESSAGE_SENT, (message: string) => {
    if (typeof message !== 'string') {
      return
    }

    const user = usersState.get(socketChannel)

    const newMessage = {
      message: message,
      id: randomUUID(),
      createdAt: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: {
        id: user.id,
        name: user.name,
      },
    }
    messages.push(newMessage)

    socket.emit(EVENTS.NEW_MESSAGE, newMessage)
  })

  socket.emit(EVENTS.INIT_MESSAGES, messages)
})

function updateUsersCount() {
  const count = usersState.size
  socket.emit(EVENTS.USERS_COUNT_UPDATING, count)
}

const PORT = process.env.PORT || 3009

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
