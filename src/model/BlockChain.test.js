import { describe, expect, it } from 'vitest';
import { BlockChain } from './BlockChain';
import { blockFactory, genesisBlockFactory } from '../../test/factory/block.factory';
import { blockDataFactory } from '../../test/factory/block-data.factory';
import { blockChainFactory } from '../../test/factory/block-chain.factory';
import { Block } from './Block';

describe('Blockchain', () => {
    describe('init', function () {
        it('should create a chain', () => {
            const chain = new BlockChain();

            expect(chain).toBeTypeOf('object');
            expect(chain.chain.length).toEqual(0);
            expect(chain.pendingTransactions.length).toEqual(0);
        });
    });

    describe('addBlock', function () {
        it('should add a block', () => {
            // Arrange
            const block = blockFactory(true);

            const blockChain = new BlockChain();

            // Act
            const res = blockChain.addBlock(block);

            // Assert
            expect(blockChain.chain.length).toBe(1);
            expect(blockChain.chain[0]).toEqual(block);
            expect(res).toEqual(1);
        });
    });

    describe('getLastBlock', () => {
        it('should get the last block', () => {
            // Arrange
            const block1 = blockFactory(true);
            const block2 = blockFactory(true);

            const blockChain = new BlockChain();
            blockChain.addBlock(block1);
            blockChain.addBlock(block2);

            // Act
            const res = blockChain.getLastBlock();

            // Assert
            expect(blockChain.chain.length).toBe(2);
            expect(res).toEqual(block2);
        });
    });

    describe('getBlock', () => {
        it('should get a block by hash', () => {
            // Arrange
            const block1 = blockFactory(true);
            const block2 = blockFactory(true);

            const blockChain = new BlockChain();
            blockChain.addBlock(block1);
            blockChain.addBlock(block2);

            // Act
            const res = blockChain.getBlock(block2.hash);

            expect(blockChain.chain.length).toBe(2);
            expect(res).toEqual(block2);
        });
    });

    describe('attachToPendingTransactions', () => {
        it('should attach a new transaction to the block chain', () => {
            //Arrange
            const transaction = blockDataFactory(true);

            const blockChain = new BlockChain();
            blockChain.addBlock(genesisBlockFactory());

            // Act
            const res = blockChain.attachToPendingTransactions(transaction);

            // Assert
            expect(blockChain.pendingTransactions.length).toEqual(1);
            expect(blockChain.pendingTransactions).toEqual([transaction]);
            expect(res).toEqual(1);
        });
    });

    describe('validateChain', () => {
        it('should validate a valid chain', () => {
            // Arrange
            const block0 = genesisBlockFactory(true);

            const block1 = blockFactory(true, { index: 1, parentHash: block0.hash });
            block1.nonce = block1.proofOfWork(block0.hash, {
                index: block1.index,
                transactions: block1.transactions,
            });
            block1.hash = block1.hashBlock(
                block0.hash,
                {
                    index: block1.index,
                    transactions: block1.transactions,
                },
                block1.nonce
            );

            const block2 = blockFactory(true, { index: 2, parentHash: block1.hash });
            block2.nonce = block2.proofOfWork(block1.hash, {
                index: block2.index,
                transactions: block2.transactions,
            });
            block2.hash = block2.hashBlock(
                block1.hash,
                {
                    index: block2.index,
                    transactions: block2.transactions,
                },
                block2.nonce
            );

            const chain = blockChainFactory(true, { chain: [block0, block1, block2] });

            // Act
            const res = chain.validateChain();

            //Assert
            expect(res).toEqual(true);
        });

        it('should not validate an invalid chain when hash does not mine', () => {
            // Arrange
            const block0 = genesisBlockFactory(true);

            const block1 = blockFactory(true, { index: 1, parentHash: block0.hash });
            block1.nonce = block1.proofOfWork(block0.hash, {
                index: block1.index,
                transactions: block1.transactions,
            });
            block1.hash = block1.hashBlock(
                block0.hash,
                {
                    index: block1.index,
                    transactions: block1.transactions,
                },
                block1.nonce
            );

            const block2 = blockFactory(true, { index: 2, parentHash: block1.hash });

            const chain = blockChainFactory(true, { chain: [block0, block1, block2] });

            // Act
            const res = chain.validateChain();

            //Assert
            expect(res).toEqual(false);
        });

        it('should not validate an invalid chain when parent hash does not match', () => {
            // Arrange
            const block0 = genesisBlockFactory(true);

            const block1 = blockFactory(true, { index: 1, parentHash: block0.hash });
            block1.nonce = block1.proofOfWork(block0.hash, {
                index: block1.index,
                transactions: block1.transactions,
            });
            block1.hash = block1.hashBlock(
                block0.hash,
                {
                    index: block1.index,
                    transactions: block1.transactions,
                },
                block1.nonce
            );

            const block2 = blockFactory(true, { index: 2 });
            block2.nonce = block2.proofOfWork(block1.hash, {
                index: block2.index,
                transactions: block2.transactions,
            });
            block2.hash = block2.hashBlock(
                block1.hash,
                {
                    index: block2.index,
                    transactions: block2.transactions,
                },
                block2.nonce
            );

            const chain = blockChainFactory(true, { chain: [block0, block1, block2] });

            // Act
            const res = chain.validateChain();

            //Assert
            expect(res).toEqual(false);
        });

        it('should not validate an invalid chain when genesis block is defective', () => {
            // Arrange
            const block0 = new Block(0, 0, '0', '0', []);

            const block1 = blockFactory(true, { index: 1, parentHash: block0.hash });
            block1.nonce = block1.proofOfWork(block0.hash, {
                index: block1.index,
                transactions: block1.transactions,
            });
            block1.hash = block1.hashBlock(
                block0.hash,
                {
                    index: block1.index,
                    transactions: block1.transactions,
                },
                block1.nonce
            );

            const block2 = blockFactory(true, { index: 2, parentHash: block1.hash });
            block2.nonce = block2.proofOfWork(block1.hash, {
                index: block2.index,
                transactions: block2.transactions,
            });
            block2.hash = block2.hashBlock(
                block1.hash,
                {
                    index: block2.index,
                    transactions: block2.transactions,
                },
                block2.nonce
            );

            const chain = blockChainFactory(true, { chain: [block0, block1, block2] });

            // Act
            const res = chain.validateChain();

            //Assert
            expect(res).toEqual(false);
        });
    });

    describe('findTransactionById', () => {
        it('should find a transaction by its id', () => {
            // Arrange
            const block1 = blockFactory(true);

            const data1 = blockDataFactory(true, { containerIndex: block1.index });
            const data2 = blockDataFactory(true, { containerIndex: block1.index });

            block1.transactions.push(data1);
            block1.transactions.push(data2);

            const block2 = blockFactory(true);

            const data3 = blockDataFactory(true, { containerIndex: block2.index });

            block2.transactions.push(data3);

            const chain = blockChainFactory(true);
            chain.addBlock(block1);
            chain.addBlock(block2);

            // Act
            const res = chain.findTransactionById(data3.id);

            // Assert
            expect(res).toEqual({
                block: {
                    index: block2.index,
                    timestamp: block2.timestamp,
                    nonce: block2.nonce,
                    parentHash: block2.parentHash,
                    hash: block2.hash,
                },
                transaction: data3,
            });
        });
    });

    describe('findTransactionsByAddress', () => {
        it('should find transactions by address', () => {
            // Arrange
            const block1 = blockFactory(true);

            const data1 = blockDataFactory(true, { containerIndex: block1.index });
            const data2 = blockDataFactory(true, { containerIndex: block1.index, recipient: data1.sender });

            block1.transactions.push(data1);
            block1.transactions.push(data2);

            const block2 = blockFactory(true);

            const data3 = blockDataFactory(true, { containerIndex: block2.index });

            block2.transactions.push(data3);

            const chain = blockChainFactory(true);
            chain.addBlock(block1);
            chain.addBlock(block2);

            // Act
            const res = chain.findTransactionsByAddress(data1.sender);

            // Assert
            expect(res).toEqual([data1, data2]);
        });
    });
});
