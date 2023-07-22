import express from 'express';
import TransactionController from '../controllers/transaction.controller.js';

const router = express.Router();
const controller = new TransactionController();

router.post('/', controller.post);
router.get('/:transactionId', controller.get);
router.get('/address/:address', controller.findByAddress);
router.post('/broadcast', controller.broadcast);

export default router;
