import { fakerEN } from '@faker-js/faker';
import { NetworkNode } from '../../src/model/NetworkNode';

export const networkNodeFactory = (object = false, params = {}) => {
    const networkNodeId = params?.networkNodeId ? params.networkNodeId : fakerEN.string.uuid();
    const networkNodeUrl = params?.networkNodeUrl ? params.networkNodeUrl : fakerEN.internet.ipv4();

    return object
        ? new NetworkNode(networkNodeId, networkNodeUrl)
        : {
              networkNodeId: networkNodeId,
              networkNodeUrl: networkNodeUrl,
          };
};
