# Chat App

This repository contains a full-stack chat application with a React client and an Express + Socket.IO server.

## What is implemented

- User registration and login with JWT authentication
- Protected API routes using auth middleware
- One-to-one and group chat creation
- Message persistence using MongoDB for socket-based chat messages
- Real-time communication with Socket.IO
- Online/offline status updates for users
- Typing indicator events for active chats
- File upload support using Cloudinary
- User listing and online user listing endpoints
- Request validation using Joi

## Features

### Authentication

- Register new users with `name`, `email`, and `password`
- Login users and return a JWT token
- Protect API routes with `Bearer <token>` authorization

### Chats

- Create one-to-one chats
- Create group chats with a `groupName` and participant list
- Fetch chats for the authenticated user
- Delete chats owned by the authenticated user

### Messages

- Send and retrieve chat messages via Socket.IO
- Persist messages to MongoDB with sender, chat ID, text, and optional file URL
- Support real-time message delivery across chat participants

### File uploads

- Upload files from the client to Cloudinary
- Return a `fileUrl`, `publicId`, and `resourceType` for uploaded content

### Realtime events

Socket events implemented in the server:

- `connection` - authenticates socket connections using JWT
- `chat:join` - join a socket room for a specific chat
- `message:send` - send a new chat message
- `message:receive` - receive a new chat message
- `typing` - broadcast typing state to chat participants
- `user:status` - notify participants when a user's online/offline state changes

## API Endpoints

### Auth

- `POST /api/auth/register`
  - Body: `{ name, email, password }`
- `POST /api/auth/login`
  - Body: `{ email, password }`

### Chat

- `POST /api/chat/group`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ groupName, users: [userId, ...] }`
- `POST /api/chat/send`
  - Body: `{ text }`
  - This route uses in-memory storage for basic message sending in the REST API path.
- `POST /api/chat/upload`
  - Multipart form-data with field `file`
  - Uploads content to Cloudinary
- `GET /api/chat/messages`
  - Returns the current in-memory message list

### Users

- `GET /api/users`
  - Returns all users except the currently authenticated user
- `GET /api/users/online`
  - Returns all online users except the currently authenticated user

## Environment variables

The server requires the following environment variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUD_NAME` or `CLOUDINARY_CLOUD_NAME`
- `CLOUD_API_KEY` or `CLOUDINARY_API_KEY`
- `CLOUD_API_SECRET` or `CLOUDINARY_API_SECRET`

## Setup and run

### Server

1. Open `server` folder
2. Install dependencies
   - `npm install`
3. Copy `.env.example` to `.env` and update values
   - `cp .env.example .env`
   - or create `.env` manually with the required values
4. Start the server
   - `npm start`
   - or `npm run start:dev` to use `nodemon`
5. Run backend tests
   - `npm test`

### Client

1. Open `client` folder
2. Install dependencies
   - `npm install`
3. Start the React app
   - `npm start`

## Notes

- The server uses Express and Socket.IO for realtime chat functionality.
- Chat and message storage are backed by MongoDB models defined in `server/src/models`.
- File uploads are forwarded to Cloudinary and require valid Cloudinary credentials.
- Socket authentication uses the same JWT token returned by the login endpoint.

## Project structure

- `client/` - React frontend application
- `server/` - Express API server
  - `server/src/routes` - API route definitions
  - `server/src/controllers` - business logic for auth, chat, message, upload, and users
  - `server/src/socket` - Socket.IO realtime event handling
  - `server/src/models` - MongoDB schemas for users, chats, and messages
  - `server/src/config` - database and Cloudinary configuration
