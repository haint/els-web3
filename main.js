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

const args = process.argv.slice(2)

const start = args[0]
const end = args[1]

const currentBlock = web3.eth.blockNumber
console.log('Highest block', currentBlock)

if (start > currentBlock) start = currentBlock

async function indexTransactions(start, end) {
  for (var i = start; i < end; i++) {

    try {
      const start = new Date()
      console.log('Index transactions of block:', i)
      
      const block = await web3.eth.getBlock(i, true)

      for(var j = 0; j < block.transactions.length; j++) {
        
        const transaction = block.transactions[j]

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
        data.timestamp = block.timestamp

        // const receipt = await web3.eth.getTransactionReceipt(transaction.hash)

        // data.gasUsed = receipt.gasUsed
        // data.status = web3.toDecimal(receipt.status)

        const existed = await client.exists({
          index: 'eth_trans',
          type: '_doc',
          id: transaction.hash
        })

        if (existed) continue

        await client.create({
          index: 'eth_trans',
          type: '_doc',
          id: transaction.hash,
          body: data
        })

        console.log('Index transaction', transaction.hash)
      }

      console.log('Index %d transactions of block %d in %s (ms)', block.transactions.length, i, new Date() - start)

    } catch (err) {
      console.log("Occurs an error", err)
    }
  }
}

indexTransactions(start, end)