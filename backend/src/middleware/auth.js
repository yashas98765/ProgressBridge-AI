import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'progressbridge_jwt_secret_key_sih2026';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated user.' });
    }
    if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: `Access denied. Requires one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }
    next();
  };
}
