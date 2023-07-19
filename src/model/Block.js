import sha256 from 'sha256';

export const PROOF_OF_WORK_COMPLEXITY = 4;
export const PROOF_OF_WORK_CHARACTER = '0';

export function Block(index = 0, nonce = 0, parentHash = '0000', hash = '0000', transactions = []) {
    this.index = index;
    this.timestamp = Date.now();
    this.nonce = nonce;
    this.parentHash = parentHash;
    this.hash = hash;
    this.transactions = transactions;
}

Block.prototype.hashBlock = function (parentHash, blockData, nonce) {
    const dataAsString = parentHash + nonce.toString() + JSON.stringify(blockData);

    return sha256(dataAsString);
};

Block.prototype.proofOfWork = function (parentHash, blockData) {
    let nonce = 0;
    let hash;

    do {
        hash = this.hashBlock(parentHash, blockData, nonce++);
    } while (!this.isMined(hash));

    return nonce - 1;
};

Block.prototype.isMined = function (hash) {
    return (
        hash.substring(0, PROOF_OF_WORK_COMPLEXITY) ===
        Array(PROOF_OF_WORK_COMPLEXITY).fill(PROOF_OF_WORK_CHARACTER).join('')
    );
};
