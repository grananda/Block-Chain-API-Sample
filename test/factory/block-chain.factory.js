import { BlockChain } from '../../src/model/BlockChain';

export const blockChainFactory = (object = false, params = {}) => {
    const chain = params?.chain ? params.chain : [];
    const pendingTransactions = params?.pendingTransactions ? params.pendingTransactions : [];

    return object
        ? new BlockChain(chain, pendingTransactions)
        : {
              chain: chain,
              pendingTransactions: pendingTransactions,
          };
};
