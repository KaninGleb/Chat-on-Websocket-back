import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { randomUUID } from 'node:crypto'
import type { Message, User } from './types.ts'

const app = express()

const httpServer = createServer(app)

const EVENTS = {
  INIT_MESSAGES: 'init-messages-published',
  NEW_MESSAGE: 'new-message-sent',
  USER_TYPING: 'user-typing',
  USER_STOP_TYPING: 'user-stopped-typing',
  USERS_COUNT_UPDATING: 'users-count-updated',
  DISCONNECT: 'disconnect',
  CLIENT_TIMEZONE_SENT: 'client-timezone-sent',
  CLIENT_NAME_SENT: 'client-name-sent',
  CLIENT_MESSAGE_SENT: 'client-message-sent',
  CLIENT_TYPED: 'client-typed',
  CLIENT_STOPPED_TYPING: 'client-stopped-typing',
} as const

const messages: Message[] = [
  {
    message: 'Hello, Viktor!',
    id: randomUUID(),
    createdAt: new Date(Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Minsk',
    }),
    user: { id: randomUUID(), name: 'Dimych' },
  },
  {
    message: 'Hello, Dimych!',
    id: randomUUID(),
    createdAt: new Date(Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Minsk',
    }),
    user: { id: randomUUID(), name: 'Viktor' },
  },
]

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

const usersState = new Map<string, User>()

app.get('/', (_req, res) => {
  res.send("Hello, it's WS server")
})

io.on('connection', (socket: Socket) => {
  console.log('New user connected:', socket.id)

  const user: User = {
    id: randomUUID(),
    name: 'Anonymous',
  }

  usersState.set(socket.id, user)

  updateUsersCount()

  socket.emit(EVENTS.INIT_MESSAGES, messages)

  socket.on(EVENTS.CLIENT_TIMEZONE_SENT, (timeZone: string) => {
    if (typeof timeZone !== 'string') return

    const user = usersState.get(socket.id)
    if (user) {
      user.timeZone = timeZone
    }
  })

  socket.on(EVENTS.CLIENT_NAME_SENT, (name: string) => {
    if (typeof name !== 'string') return

    const user = usersState.get(socket.id)
    if (user) {
      user.name = name
    }
  })

  socket.on(EVENTS.CLIENT_MESSAGE_SENT, (message: string) => {
    if (typeof message !== 'string') return

    const user = usersState.get(socket.id)
    if (!user) return

    const newMessage = {
      message: message,
      id: randomUUID(),
      createdAt: new Date(Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: user.timeZone || 'UTC',
      }),
      user: {
        id: user.id,
        name: user.name,
      },
    }

    messages.push(newMessage)
    io.emit(EVENTS.NEW_MESSAGE, newMessage)
  })

  socket.on(EVENTS.CLIENT_TYPED, () => {
    const user = usersState.get(socket.id)
    if (user) {
      socket.broadcast.emit(EVENTS.USER_TYPING, user)
    }
  })

  socket.on(EVENTS.CLIENT_STOPPED_TYPING, () => {
    const user = usersState.get(socket.id)
    if (user) {
      socket.broadcast.emit(EVENTS.USER_STOP_TYPING, user)
    }
  })

  socket.on(EVENTS.DISCONNECT, () => {
    const user = usersState.get(socket.id)
    if (user) {
      socket.broadcast.emit(EVENTS.USER_STOP_TYPING, user)
      usersState.delete(socket.id)
      updateUsersCount()
    }
  })
})

function updateUsersCount() {
  const count = usersState.size
  io.emit(EVENTS.USERS_COUNT_UPDATING, count)
}

const PORT = process.env.PORT || 3009

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
