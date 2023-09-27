/**
 * This callback tells Unix time in seconds
 * @callback nowCallback
 * @returns {number} - Seconds since Unix epoch
 */
async function now() {
  const res = await fetch("https://polygon-mumbai-bor.publicnode.com", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: [{
        topics:[
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        ]
      }],
      "id": 1
    })
  })

  const json = await res.json();

  const jsonMock = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": [
      {
        "address": "0x0fa8781a83e46826621b3bc094ea2a0212e71b23",
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000ff71e59ea889eeb51ae39edba09511c0b2b1b4fb",
          "0x000000000000000000000000805963ecc406ed18538a73f7023369243066a808"
        ],
        "data": "0x0000000000000000000000000000000000000000000000000000000000002af8",
        "blockNumber": "0x26b0fc6",
        "transactionHash": "0x492cf226f01dac3b9ef1b84357195591ffc6d9e8333d411b38e1cf30a9a5b6f1",
        "transactionIndex": "0x9",
        "blockHash": "0x5af367825ea843623f9794a55b6ae7622372d37ec8f8ef9448260b24ee6437f3",
        "logIndex": "0x1d",
        "removed": false
      }
    ]
  }

  const number = json.result[0]?.blockNumber ?? "0"

  return BigInt(number).toString()
}

/**
 * Interface of the Time source
 * @typedef {Object} sourceTimeAPI
 * @property {nowCallback} now
 */

/**
 * Source that tells time
 * @returns {sourceTimeAPI}
 */
export async function SourceMarket() {
  return { now }
}
