# React Native + Node Chat (Socket.IO)
A **real-time 1:1 chat app** built with **React Native (Expo)** and **Node.js + Socket.IO**.  
Features include JWT authentication, live messaging, typing indicators, presence (online/offline), and message receipts.  
Messages are stored in **MongoDB** for persistence.

**Demo Url**

https://jainswati972003.wistia.com/medias/e4d3ew6zz4

## Requirements
- Node 18+
- MongoDB 6+
- Expo CLI (for mobile)

## Setup
### Server
1. `cd server && cp .env.example .env`
2. Fill MONGO_URI and JWT_SECRET.
3. `npm i && npm run dev`

### Mobile (Expo)
1. `cd mobile && cp .env.example .env`
2. Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` (use host IP on device).
3. `npm i && npm run start`

## API
- POST /auth/register
- POST /auth/login
- GET /users (auth)
- GET /conversations/:id/messages (auth)
- POST /conversations (helper)

## Sockets
- emit: message:send, typing:start|stop, message:read, message:delivered
- on: message:new, message:updated, typing, presence

## Sample Users
- alice@example.com / Passw0rd!
- bob@example.com / Passw0rd!

## Notes
- For device testing, replace `localhost` with your machine IP in mobile `.env`.
