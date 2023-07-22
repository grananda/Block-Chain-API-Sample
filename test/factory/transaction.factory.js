import { fakerEN } from '@faker-js/faker';

export const transactionFactory = (params = {}) => {
    const id = fakerEN.string.uuid();
    const sender = params?.sender ? params.sender : fakerEN.string.uuid();
    const recipient = params?.recipient ? params.recipient : fakerEN.string.uuid();
    const data = params?.data
        ? params.data
        : [
              {
                  param: fakerEN.number.int(),
              },
          ];

    return {
        id: id,
        sender: sender,
        recipient: recipient,
        data: data,
    };
};
