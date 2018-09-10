const _ = require('lodash')
const Web3 = require('web3')
const els = require('elasticsearch')
const BigNumber = require('bignumber.js')
const fs = require('fs');

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/v3/b48465719cae4527b984c1b2a5767c3e"))

const client = new els.Client({
  host: 'els-demo:9200',
  log: 'info'
})

async function sync() {
  const currentBlock = web3.eth.blockNumber
  console.log('Highest block', currentBlock)

  var resp = await client.search({
    index: 'eth_trans',
    size: 0,
    body: {
      aggs: {
        max_block: { 
          max: {
            field: 'blockNumber'
          }
        }
      }
    }
  })

  const blockNumber = resp.aggregations.max_block.value
  console.log('Highest index', blockNumber)

  if (blockNumber === currentBlock) return

  for (var i = blockNumber + 1; i <= currentBlock; i++) {
    const block = await web3.eth.getBlock(i, true)
    if (block.transactions.length === 0) continue

    console.log('%s: Submit index %d transactions of block', new Date(), block.transactions.length, i)
    _.each(block.transactions, transaction => {
      indexTransaction(transaction, block.timestamp)
    })
  }
}

function indexTransaction(transaction, timestamp) {
  const data = {}
  const value = new BigNumber(transaction.value).shiftedBy(-18)
  const gasPrice = new BigNumber(transaction.gasPrice).shiftedBy(-9)

  data.blockNumber = transaction.blockNumber
  data.blockHash = transaction.blockHash
  data.input = transaction.input
  data.from = transaction.from
  data.to = transaction.to
  data.value = value.toNumber()
  data.valueStr = value.toString()
  data.gas = transaction.gas
  data.gasPrice = gasPrice.toNumber()
  data.timestamp = timestamp

  const start = new Date()
  client.create({
    index: 'eth_trans',
    type: '_doc',
    id: transaction.hash,
    body: data
  }, (err, resp) => {
    if (!err) console.log('Index transaction %s of block %d in %d(ms)', transaction.hash, transaction.blockNumber, new Date() - start)
  })
}

var schedule = require('node-schedule')
schedule.scheduleJob('*/10 * * * * *', sync)