import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import sendEmail from '../utils/email.js';

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

export const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide your email address.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No user found with that email.' });
  }

  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  user.passwordResetCode = resetCode;
  user.passwordResetExpires = new Date(expires);
  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Your EduMove Password Reset Code',
      body: `<p>Hello ${user.name},</p><p>Your password reset code is: <b>${resetCode}</b></p><p>This code will expire in 10 minutes.</p>`,
    });
    res.status(200).json({ status: 'success', message: 'Reset code sent to email.' });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
};

export const resetPasswordWithCode = async (req, res, next) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, code, and new password.' });
  }

  const user = await User.findOne({ email, passwordResetCode: code });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  user.password = newPassword;
  // user.passwordResetCode = undefined;
  // user.passwordResetExpires = undefined;

  console.log(user);

  await user.save();

  res.status(200).json({ status: 'success', message: 'Password has been reset successfully.' });
};
