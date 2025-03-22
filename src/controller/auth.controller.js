import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK IF EMAIL AND PASSWORD ARE PRESENT
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // 2) CHECK IF USER EXISTS AND PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({
      status: 'fail',
      message: 'Email or password is incorrect',
    });

  // 3) IF EVERYTHING OK, SIGN AND SEND TOKEN TO CLIENT
  createAndSendToken(user, 200, res);
};
