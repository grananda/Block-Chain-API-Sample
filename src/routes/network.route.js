import express from 'express';
import NetworkController from '../controllers/network.controller.js';

const router = express.Router();
const controller = new NetworkController();

router.get('/', controller.get);
router.post('/node/broadcast', controller.broadcast);
router.post('/node', controller.post);
router.post('/node/bulk', controller.bulk);

export default router;
