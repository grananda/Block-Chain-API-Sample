import { fakerEN } from '@faker-js/faker';
import { NetworkNode } from '../../src/model/NetworkNode';

export const networkNodeFactory = (object = false) => {
    const networkNodeId = fakerEN.string.uuid();
    const networkNodeUrl = fakerEN.internet.ipv4();

    return object
        ? new NetworkNode(networkNodeId, networkNodeUrl)
        : {
              networkNodeId: networkNodeId,
              networkNodeUrl: networkNodeUrl,
          };
};
