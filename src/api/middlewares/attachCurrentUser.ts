import { Container } from 'typedi';
import UserService from '../../services/users';
import * as jwt from 'jsonwebtoken';
import { getTokenFromHeader } from './isAuth';

/**
 * Attach user to req.user
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 * @param {*} allowUnauthorized  Allow Unauthorized requests
 */
const attachCurrentUser = async (req, res, next) => {
  try {
    const extractedToken = getTokenFromHeader(req);
    const token = req.token || jwt.decode(extractedToken);
    if (token) {
      const userServiceInstance = Container.get(UserService);
      const userRecord = await userServiceInstance.findOne(token.id);
      if (!userRecord) {
        return res.sendStatus(401);
      }
      const currentUser = userRecord;
      Reflect.deleteProperty(currentUser, 'password');
      Reflect.deleteProperty(currentUser, 'salt');
      req.currentUser = currentUser;
      req.currentUser.os = token?.os;
      return next();
    } else if (!req.token && req.isPublic) {
      req.currentUser = null;
      return next();
    }
  } catch (e) {
    console.log(' Error attaching user to req');
    console.log(e);
    return next(e);
  }
};

export default attachCurrentUser;
