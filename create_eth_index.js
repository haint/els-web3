const els = require('elasticsearch')

var client = new els.Client({
  host: 'els-demo:9200',
  log: 'info'
})

client.indices.create({
  index: 'eth_trans',
  body: {
    settings: {
      index: {
        number_of_shards: 5,
        number_of_replicas: 1
      }
    }
  }
}, (err, resp) => {
  if (err) console.log('Error: ', err)
  else console.log('Result: ', resp)
})