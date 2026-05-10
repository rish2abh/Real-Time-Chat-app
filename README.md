# 💬 Chat App

A full-stack **real-time chat application** built for speed and simplicity. Supports private and group conversations, live typing indicators, online presence, and file sharing — all powered by WebSockets.

> **Stack:** React · Node.js · Express · Socket.IO · MongoDB · Cloudinary



<!-- Uncomment and update once you have screenshots -->
<!--
| Login | Chat Window | Group Chat |
|---|---|---|
| ![Login](./screenshots/login.png) | ![Chat](./screenshots/chat.png) | ![Group](./screenshots/group.png) |
-->

---

## ✨ Features at a glance

| Feature | Details |
|---|---|
| 🔐 Auth | Register / Login with JWT — token verified on every API call and socket connection |
| 💬 One-to-one chat | Start a private conversation with any registered user |
| 👥 Group chat | Create named groups with multiple participants |
| ⚡ Real-time | Messages delivered instantly via Socket.IO and persisted to MongoDB |
| 🟢 Online status | Live online / offline presence across all participants |
| ✍️ Typing indicator | See when the other person is typing |
| 😀 Emoji support | Built-in emoji picker in the message composer |
| 📎 File sharing | Images render inline — other files show a download card |
| 🗑️ Chat deletion | Remove any chat you are a participant of |

---

## 🛠️ Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + custom hooks | Clean state separation per feature |
| Backend | Node.js + Express | Lightweight, fast REST API |
| Realtime | Socket.IO 4 | Bidirectional events with room-based broadcasting |
| Database | MongoDB + Mongoose | Flexible document storage for chats and messages |
| Auth | JWT + bcryptjs | Stateless auth, secure password hashing |
| File storage | Cloudinary | Managed image and file hosting |
| Validation | Joi | Schema-based request validation |
| Testing | Jest + Supertest | Backend unit and integration tests |

---

## 📁 Project structure

```
chat-app/
├── client/                         # React frontend
│   └── src/
│       ├── api/
│       │   └── client.js           # All API calls in one place (fetch wrapper)
│       ├── components/
│       │   ├── AuthPage.jsx         # Login / Register screen
│       │   ├── ChatSidebar.jsx      # Chat list + new group creation
│       │   ├── ChatWindow.jsx       # Active chat header and layout shell
│       │   ├── Composer.jsx         # Message input, emoji picker, file upload
│       │   ├── MessageBubble.jsx    # Individual message (text / image / file)
│       │   ├── MessageList.jsx      # Scrollable message feed
│       │   └── OnlineUsers.jsx      # User list with live presence dots
│       └── hooks/
│           ├── useSocket.js         # Socket connection + all event listeners
│           ├── useChats.js          # Chat list state, create, delete
│           └── useMessages.js       # Message state, send, file upload
│
└── server/                         # Express + Socket.IO backend
    └── src/
        ├── config/                  # MongoDB, CORS, Cloudinary config
        ├── controllers/             # Route handlers (auth, chats, messages, upload, users)
        ├── middleware/              # JWT auth, multer file handling, Joi validation
        ├── models/                  # Mongoose schemas — User, Chat, Message
        ├── routes/                  # Express route definitions
        ├── socket/                  # Socket.IO server + event handlers
        ├── utils/                   # asyncHandler, API response helpers
        └── validations/             # Joi schemas for request bodies
```

---

## 🔌 API reference

### Auth — no token required

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

### Chats — `Authorization: Bearer <token>` required

| Method | Endpoint | Body |
|---|---|---|
| GET | `/api/chats` | — |
| POST | `/api/chats` | `{ participantId }` |
| POST | `/api/chats/group` | `{ groupName, users: [userId, ...] }` |
| DELETE | `/api/chats/:chatId` | — |

### Messages — auth required

| Method | Endpoint |
|---|---|
| GET | `/api/messages/:chatId` |

### Users — auth required

| Method | Endpoint |
|---|---|
| GET | `/api/users` |
| GET | `/api/users/online` |

### Upload — auth required

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/upload` | `multipart/form-data`, field name: `file` |

---

## 📡 Socket events

### Client → Server

| Event | Payload | What it does |
|---|---|---|
| `chat:join` | `chatId` | Join a room to receive messages |
| `leave` | `chatId` | Leave a chat room |
| `message:send` | `{ chatId, message, file? }` | Send a message (text or file URL) |
| `typing` | `{ chatId, isTyping }` | Tell others you are / aren't typing |

### Server → Client

| Event | Payload | What it means |
|---|---|---|
| `message:receive` | Message object | New message in a joined chat |
| `message:error` | `{ error }` | Message failed to send |
| `typing` | `{ chatId, senderId, isTyping }` | Someone else is typing |
| `status` | `{ userId, status }` | A user came online or went offline |
| `chat:created` | Chat object | You were added to a new group chat |

---

## 🗄️ Data models

```js
// User
{ name, email, password, status: "online" | "offline" }

// Chat
{ participants: [userId], isGroup: Boolean, groupName: String }

// Message
{ chatId, senderId, message: String, file: String | null, createdAt }
```

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Cloudinary](https://cloudinary.com) account (free tier is fine)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Start the server

```bash
cd server
npm install
cp .env.example .env      # then fill in your values
npm run start:dev
```

### 3. Start the client

```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`. API runs at `http://localhost:5000`.

### 4. Run tests

```bash
cd server
npm test
```

---

## ⚙️ Environment variables

`server/.env` — copy from `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_strong_secret_here
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

`client/.env.local` — optional, defaults to localhost:

```env
REACT_APP_API_URL=http://localhost:5000
```

> ⚠️ Never commit your real `.env` file — it is already in `.gitignore`.

---

## 🔐 How auth works

```
Login → server returns JWT (7 days)
      → stored in localStorage
      → sent as: Authorization: Bearer <token>  (every API request)
      → sent as: socket.handshake.auth.token    (socket connection)
      → server middleware verifies before any request or event is processed
```

---

## ⚡ How real-time messaging works

```
Open a chat   → client emits chat:join
              → server verifies participant, adds socket to room

Send message  → client emits message:send
              → server saves to MongoDB
              → server emits message:receive to all room sockets

Close all tabs → disconnect fires
              → server checks remaining sockets for that user
              → if none left → marks offline, notifies participants
                (multi-tab handled correctly)
```

---

## 🗺️ Planned improvements

- [ ] Message pagination (currently loads last 50)
- [ ] Read receipts
- [ ] Push notifications
- [ ] Message search
- [ ] Production deployment

---

## 📄 License

MIT
