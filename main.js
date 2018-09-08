const _ = require('lodash')
const Web3 = require('web3')
const els = require('elasticsearch')
const BigNumber = require('bignumber.js')
const fs = require('fs');

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider("http://geth-node:8545"))

const client = new els.Client({
  host: 'els-demo:9200',
  log: 'info'
})

const sync = web3.eth.syncing 
const currentBlock = sync.currentBlock

console.log(currentBlock)

async function indexTransactions(currentBlock) {
  for (var i = currentBlock; i >=0; i--) {

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

        const receipt = await web3.eth.getTransactionReceipt(transaction.hash)

        data.gasUsed = receipt.gasUsed
        data.status = web3.toDecimal(receipt.status)
        data.timestamp = block.timestamp

        const existed = await client.exists({
          index: 'eth',
          type: '_doc',
          id: transaction.hash
        })

        if (existed) continue

        await client.create({
          index: 'eth',
          type: '_doc',
          id: transaction.hash,
          body: data
        })
      }

      fs.writeFileSync('./index.last', i, err => {
        console.log(err)
      })

      console.log('Index %d transactions of block %d in %s (ms)', block.transactions.length, i, new Date() - start)
      
    } catch (err) {
      console.log("Occurs an error", err)
    }
  
    // web3.eth.getBlock(i, true, (err, result) => {
  
    //   console.log(err)
  
    //   console.log(result)
  
    //   const start = new Date()
    //   console.log('Index transactions of block:', i)
  
    //   
  
    //   console.log('End index block\'s transactions in ', new Date() - start)
    // })
  }
}

indexTransactions(currentBlock)