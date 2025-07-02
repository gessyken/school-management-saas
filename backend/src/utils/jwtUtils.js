import jwt from 'jsonwebtoken';

export const generateToken = (userId, schoolId) => {
  return jwt.sign({ userId, schoolId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};
