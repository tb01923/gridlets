/**
 * Created by tbrown on 5/29/16.
 */ 
const KafkaChannel = require('./channel-implementations/kafka-channel/kafka-channel');

module.exports.Kafka = module.exports.getKafka = (channelName) => KafkaChannel.of(global.zookeeperConn, channelName); 
