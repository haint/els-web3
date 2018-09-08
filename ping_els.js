const els = require('elasticsearch')

var client = new els.Client({
  host: 'els-demo:9200',
  log: 'info'
})

client.ping({
  requestTimeout: 30000
}, err => {
  if (err)
    console.log('ELS cluster is down')
  else
    console.log('All is well')
})