/**
 * This callback tells Unix time in seconds
 * @callback nowCallback
 * @returns {number} - Seconds since Unix epoch
 */
async function now() {
  const res = await fetch("https://data-seed-prebsc-1-s1.binance.org:8545", {
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
