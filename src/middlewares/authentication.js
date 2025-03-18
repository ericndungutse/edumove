import { User } from '../model/user.model.js';
import { verifyJWToken } from '../utils/utils.js';

// Protect
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1) GET THE TOKEN AND CHECK IF IT EXIST
    if (req.headers.authorization) token = req.headers.authorization.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'Access denied. Please signin again to continue.',
      });
      return;
    }

    // 2) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
    const { id } = verifyJWToken(token);

    // 3) CHECK IF USER STILL EXIST
    const currentUser = await User.findById(id);
    if (!currentUser)
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });

    // 6) GRANT ACCESS (AUTHORIZE)
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
