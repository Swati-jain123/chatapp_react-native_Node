import jwt from 'jsonwebtoken';

export function authRest(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }
}

export function authSocket(socket, next) {
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return next(new Error('No token'));
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) { next(e); }
}
