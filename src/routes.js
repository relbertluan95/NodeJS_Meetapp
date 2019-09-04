import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetappController from './app/controllers/MeetappController';
import OrganizingController from './app/controllers/OrganizingController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/user', UserController.update);
routes.post('/file', upload.single('file'), FileController.store);

routes.post('/meetapp', MeetappController.store);
routes.get('/meetapp', MeetappController.index);
routes.delete('/meetapp/:id', MeetappController.delete);
routes.put('/meetapp/:id', MeetappController.update);
routes.get('/organizing', OrganizingController.store);

export default routes;
