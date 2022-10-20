import { celebrate } from 'celebrate';
import { Request, Response, Router, NextFunction } from 'express';
import Joi from 'joi';

import Container from 'typedi';
import AccountsService from '../../../services/accounts';
import middlewares from '../../middlewares';
import IsPublic from '../../middlewares/isPublic';

const route = Router();
export default (app: Router) => {
  app.use('/accounts', route);

  route.delete(
    '/delete/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      try {
        const accountsServiceInstance = Container.get(AccountsService);
        const account = await accountsServiceInstance.delete(id as any, req.currentUser.id);
        return res.json({ account }).status(201);
      } catch (e) {
        console.log(' error ', e);
        return next(e);
      }
    },
  );
  route.post(
    '/privacy/:id',
    celebrate({
      body: Joi.object({
        privacy: Joi.string().valid('PRIVATE', 'PUBLIC'),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      try {
        const accountsServiceInstance = Container.get(AccountsService);
        const account = await accountsServiceInstance.changePrivacy(
          req.body.privacy,
          id as any,
          req.currentUser.id,
        );
        return res.json({ account }).status(201);
      } catch (e) {
        console.log(' error ', e);
        return next(e);
      }
    },
  );

  route.get(
    '/:id',
    IsPublic,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const accountsServiceInstance = Container.get(AccountsService);
        const accounts = await accountsServiceInstance.one(req.currentUser?.id, id);
        return res.json({ accounts }).status(201);
      } catch (e) {
        console.error(e);
        next(new Error('Account not found'));
      }
    },
  );
  route.get(
    '/',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const accountsServiceInstance = Container.get(AccountsService);
        const accounts = await accountsServiceInstance.all(req.currentUser.id);
        return res.json({ accounts }).status(201);
      } catch (e) {
        next(e);
      }
    },
  );
  route.post(
    '/add',
    celebrate({
      body: Joi.object({
        championsWithSkins: Joi.array().required(),
        RP: Joi.object({
          RP: Joi.number(),
        }).required(),
        allCurrencies: Joi.object().required(),
        loot: Joi.array().required(),
        emailVerification: Joi.object().required(),
        honorLevel: Joi.object().required(),
        emotes: Joi.array().required(),
        rankedStats: Joi.object().required(),
        profile: Joi.object().required(),
        mmr: Joi.object(),
        background: Joi.string(),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const accountsServiceInstance = Container.get(AccountsService);
        const account = await accountsServiceInstance.add(req.body, req.currentUser.id as any);
        return res.json({ account }).status(201);
      } catch (e) {
        console.log(' error ', e);
        return next(e);
      }
    },
  );
};
