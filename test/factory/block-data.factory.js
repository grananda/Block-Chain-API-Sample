import { fakerEN } from '@faker-js/faker';
import { BlockData } from '../../src/model/BlockData';

export const blockDataFactory = (object = false, params = {}) => {
    const id = params?.id ? params.id : fakerEN.number.int({ min: 100, max: 200 });
    const containerIndex = params?.containerIndex ? params.containerIndex : fakerEN.number.int({ min: 100, max: 200 });
    const sender = params?.sender ? params.sender : fakerEN.string.uuid();
    const recipient = params?.recipient ? params.recipient : fakerEN.string.uuid();
    const data = params?.data
        ? params.data
        : [
              {
                  param: fakerEN.number.int(),
              },
          ];

    return object
        ? new BlockData(id, containerIndex, sender, recipient, data)
        : {
              id: id,
              containerIndex: containerIndex,
              timestamp: Date.now(),
              sender: sender,
              recipient: recipient,
              data: data,
          };
};
