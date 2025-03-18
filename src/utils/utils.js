import jwt from 'jsonwebtoken';

export const verifyJWToken = (userToken) => {
  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
};
