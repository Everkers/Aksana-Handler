import { Router } from 'express';
import auth from './auth';
import users from './users';
import account from './account';
const router = Router();
auth(router);
users(router);
account(router);

export default router;
