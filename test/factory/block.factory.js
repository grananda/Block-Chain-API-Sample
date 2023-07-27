import { fakerEN } from '@faker-js/faker';
import { Block } from '../../src/model/Block';
import { blockDataFactory } from './block-data.factory';

export const blockFactory = (object = false, params = {}) => {
    const index = params?.index ? params.index : fakerEN.number.int({ min: 100, max: 200 });
    const nonce = params?.nonce ? params.nonce : fakerEN.number.int({ min: 1000, max: 2000 });
    const hash = params?.hash ? params.hash : fakerEN.git.commitSha();
    const parentHash = params?.parentHash ? params.parentHash : fakerEN.git.commitSha();
    const transactions = params?.transactions
        ? params.transactions
        : [
              Array(
                  fakerEN.number.int({
                      min: 1,
                      max: 3,
                  })
              ).keys(),
          ].map(() => blockDataFactory(object, { containerIndex: index }));

    return object
        ? new Block(index, nonce, parentHash, hash, transactions)
        : {
              index: index,
              timestamp: Date.now(),
              nonce: nonce,
              parentHash: parentHash,
              hash: hash,
              transactions: transactions,
          };
};

export const genesisBlockFactory = (object = false) => {
    const index = 0;
    const nonce = 0;
    const hash = '0000';
    const parentHash = '0000';
    const transactions = null;

    return object
        ? new Block(index, nonce, parentHash, hash, transactions)
        : {
              index: index,
              timestamp: Date.now(),
              nonce: nonce,
              parentHash: parentHash,
              hash: hash,
              transactions: transactions,
          };
};
