const els = require('elasticsearch')

var client = new els.Client({
  host: 'els-demo:9200',
  log: 'info'
})

client.indices.delete({
  index: 'eth'
}, (err, resp) => {
  if (err) console.log('Error: ', err)
  else console.log('Result: ', resp)
})