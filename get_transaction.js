const _ = require('lodash')
const Web3 = require('web3')
const els = require('elasticsearch')
const BigNumber = require('bignumber.js')
const fs = require('fs');

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/v3/b48465719cae4527b984c1b2a5767c3e"))

console.log(web3.eth.blockNumber)
console.log(web3.eth.getBalance("0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8"));

web3.eth.getBlock('latest', (err, result) => {
  console.log(result)
})

// web3.eth.getTransaction('0x984a873492fbbfbcc63652d9b95a1b181d82843ab441df40c7940fdc113482d5', (err, transaction) => {
//   console.log(transaction)
//   console.log(transaction.value)
//   console.log(transaction.gasPrice)
//   console.log('-------------------------------------------------')

//   let value = new BigNumber(transaction.value)
//   value = value.shiftedBy(-18)

//   let gasPrice = new BigNumber(transaction.gasPrice)
//   gasPrice = gasPrice.shiftedBy(-9)

//   console.log(value.toNumber())
//   console.log(value.toString())
//   console.log(gasPrice.toNumber())
//   console.log(gasPrice.toString())
// })

// web3.eth.getTransactionReceipt('0x984a873492fbbfbcc63652d9b95a1b181d82843ab441df40c7940fdc113482d5', (err, result) => {
//   console.log(result.gasUsed)
//   console.log(web3.toDecimal(result.status))
// })