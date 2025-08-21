import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import convRoutes from './routes/conversations.js';
import { authSocket } from './middleware/auth.js';
import registerSocketHandlers from './sockets/index.js';

dotenv.config();
const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : ["http://localhost:8081", "http://localhost:19006"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get('/', (_, res) => res.json({ ok: true, service: 'chat-server' }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/conversations', convRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: (process.env.CLIENT_ORIGIN?.split(',') || '*') } });
io.use(authSocket);
registerSocketHandlers(io);

mongoose.connect(process.env.MONGO_URI).then(() => {
  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log('[server] listening on ' + port));
}).catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
