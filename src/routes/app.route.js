import express from 'express';
import AppController from '../controllers/app.controller.js';

const router = express.Router();
const controller = new AppController();

router.get('/', controller.get);

export default router;
