# ⚙️ WebSocket Backend Chat Server

This is the **backend** part of a mini real-time chat application built with **`Node.js`**, **`Express`**, and **`Socket.IO`**. It provides a WebSocket server that handles client connections, broadcasts messages, manages user states, typing indicators, and tracks the number of active users in real time.

👉 The **frontend** part connects to this server to enable seamless real-time chat experience: [Chat-via-Websocket-front](https://github.com/KaninGleb/chat-via-websocket-front)

## 🚀 Features

* Real-time bidirectional messaging with `socket.io`
* User connection and disconnection handling
* Broadcasting typing indicators (`user-typing`, `user-stopped-typing`)
* Tracking and broadcasting active users count
* User identification with unique IDs, names, and timezones
* Message history initialization on client connect
* Lightweight, easy-to-extend TypeScript backend

## 🛠️ Tech Stack

* **Node.js** (ES Modules)
* **Express 5**
* **Socket.IO 4**
* **TypeScript**
* **Nodemon** (for development)
* **Prettier** (code formatting)

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/KaninGleb/Chat-via-Websocket-back.git
cd Chat-via-Websocket-back

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (with hot reload)
npm run start-dev

# Run the built server
npm start
```

> ⚠️ **Note:** This server listens by default on port 3009. You can change it via the `PORT` environment variable.

## 📁 Project Structure

```
├── src/
│   ├── app.ts          # Main server entry point and Socket.IO setup
│   ├── types.ts        # TypeScript types for Message and User
```

## 📡 WebSocket Events

* `init-messages-published` — send initial chat history to client
* `new-message-sent` — broadcast new message to all clients
* `user-typing`, `user-stopped-typing` — notify others when a user is typing or stopped typing
* `users-count-updated` — broadcast number of active users
* `client-timezone-sent` — receive client timezone info
* `client-name-sent` — receive client username
* `client-message-sent` — receive a new message from client

##  License

MIT — free to use, modify, and distribute.
