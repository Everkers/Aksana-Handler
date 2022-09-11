import { NextFunction, Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import middlewares from '../../middlewares';
import config from '../../../config';
const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  route.get('/validate-token/:token', async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      const isValid = jwt.verify(token, config.jwtSecret);
      return res.json({ isValid: true });
    } catch (e) {
      return res.json({ isValid: false });
    }
  });
  route.get(
    '/me',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response) => {
      return res.json({ user: req.currentUser }).status(200);
    },
  );
};
