import express from 'express';
import BlockChainController from '../controllers/block-chain.controller.js';

const router = express.Router();
const controller = new BlockChainController();

router.get('/', controller.get);
router.get('/mine', controller.mine);
router.get('/consensus', controller.consensus);
router.get('/block/:blockHash', controller.findBlockByHash);
router.post('/receive-new-block', controller.receiveNewBlock);

export default router;
