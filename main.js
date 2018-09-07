const _ = require('lodash')

var Web3 = require('web3')
var web3 = new Web3()
var BigNumber = require('bignumber.js')

web3.setProvider(new web3.providers.HttpProvider("http://45.76.7.104:8545"))

var sync = web3.eth.syncing 
console.log(sync)

var els = require('elasticsearch')
var client = new els.Client({
  host: 'els-demo:9200',
  log: 'trace'
})

// client.ping({
//   requestTimeout: 30000
// }, err => {
//   if (err)
//     console.log('ELS cluster is down')
//   else
//     console.log('All is well')
// })

web3.eth.getBlock(6275052, true, (err, result) => {
  _.each(result.transactions, transaction => {
    if (transaction.hash === '0x7e46c450eeef29106efef4664aaedfe2c8f8c00cbd256c4eba845b0df58aa388') {
      console.log(transaction)
      const value = transaction.value.toString()
      console.log(value)
      console.log(new BigNumber(value, 10).shiftedBy(-18).toNumber())
    }
  })
})


function testELS() {
  client.indices.create({
    index: 'eth',
    body: {
      settings: {
        index: {
          number_of_shards: 3,
          number_of_replicas: 2
        }
      }
    }
  }, (err, resp) => {
    console.log(err)
    console.log(resp)
  
    client.indices.get({
      index: 'eth'
    }, (err, resp) => {
      console.log(resp)
    })
    
    client.indices.delete({
      index: 'eth'
    }, (err, resp) => {
      console.log(resp)
    })
  })
}
