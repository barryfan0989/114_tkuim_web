import jwt from 'jsonwebtoken';

const EXPIRES_IN = '2h';
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id?.toString?.() ?? user.id,
      email: user.email,
      role: user.role
    },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

export function decodeToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

export const TOKEN_EXPIRES_IN = EXPIRES_IN;
