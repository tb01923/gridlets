const kafka = require('kafka-node')
    , KafkaClient = kafka.Client
    , KafkaProducer = kafka.Producer
    , KafkaConsumer = kafka.Consumer

// Kafka Object Factory Methods
KafkaClient.of = (zookeeperConnectionString) =>
    new KafkaClient(zookeeperConnectionString, undefined, {sessionTimeout: 21600000, spinDelay: 1000, retries: 3});
// Check to see if the client is timed-out
// if so, reconnect
// If not, return cached version of kafka producer
KafkaProducer.of = (client) =>
    new KafkaProducer(client)

KafkaConsumer.of = (client, [{topic: topic}], options) =>
    new KafkaConsumer(client, [{topic: topic}], options)

module.exports.KafkaClient = KafkaClient
module.exports.KafkaProducer = KafkaProducer
module.exports.KafkaConsumer = KafkaConsumer
