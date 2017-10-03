"use strict"
const Task = require('data.task')
const {curry} = require('ramda')
const clone = Object.create


const kafka = require('./kafka-channel-factory')
    , KafkaClient = kafka.KafkaClient
    , KafkaProducer = kafka.KafkaProducer
    , KafkaConsumer = kafka.KafkaConsumer
    , GridChannelImplementation = require('../grid-channel-implementation')

// think about having about higher throughput
// maybe by having 2 diff kafka servers


module.exports = KafkaChannel

KafkaChannel.prototype = clone(GridChannelImplementation.prototype)

function KafkaChannel(connectionString) {
    this.connectionString = connectionString
    this.ready = false
    this.client = KafkaClient.of(this.connectionString);
    this.producer = KafkaProducer.of(this.client);
    this.producer.on('ready', () => {
        this.ready = true;
    });
}
const connectedChannel = {}

//KafkaChannel.of = (connectionString) => new KafkaChannel(connectionString)
KafkaChannel.of = (connectionString, channelName) => {
    if (!connectedChannel[channelName]) {
        connectedChannel[channelName] = new KafkaChannel(connectionString)
    }
    return connectedChannel[channelName]
}

KafkaChannel.prototype.createChannels = curry(function(async, topics){
    return new Task((reject, resolve) => {
        const _createTopic = () => {
            this.producer.createTopics(topics, false, function(err, result){
                if(err != null) {
                    //console.log('create(' +topics+')', err)
                    reject(err)
                }else {
                    //console.log('create(' +topics+')', result)
                    resolve(result)
                }
            });
        }

        if (this.ready) {
            _createTopic()
        }
        else {
            this.producer.on('ready', function () {
                _createTopic()
            });
        }
    })
})



KafkaChannel.prototype.getMetaData = curry(function(async, topics) {
    return new Task((reject, resolve) => {
        const _createTopic = () => {
            this.client.loadMetadataForTopics(topics, function(err, result){
                if(err != null) {
                    reject(err)
                }else {
                    //console.log("Channel meta", JSON.stringify(result))
                    resolve(result)
                }
            });
        }

        if (this.ready) {
            _createTopic()
        }
        else {
            this.client.on('ready', function () {
                //console.log('on ready::meta')
                _createTopic()
            });
        }
    })
})

KafkaChannel.prototype.listen = function(topic, options) {
    options = options || {}
    options.autoCommit = false;
    //options.autoCommitIntervalMs = 10000

    console.log('listen(' +topic + ')', options)
    this.consumer = KafkaConsumer.of(this.client, [{topic: topic}], options);
    return this.consumer;
}

KafkaChannel.prototype.send = curry(function(topic, message, partition) {
    partition = partition || 0
    return new Task((reject, resolve) => {
        const _send = () => {
            //console.log('send (' +topic + ')', partition, message)

            this.producer.send([{topic: topic, messages: message, partition: partition}], function(err, result){
                if(err) {
                    reject(err)
                } else {
                    resolve(result)
                }

            });
        }

        if (this.ready) {
            _send()
        }
        else {
            this.producer.on('ready', function () {
                //console.log('on ready::send')
                _send()
            });
        }
    })
})

KafkaChannel.prototype.setMessageProcessed = function(message) {
    return new Task((reject, resolve) => {
        //console.log("Attempting to commit", message.offset, ' - ', message.value)
        this.consumer.commit(true, function (err, data) {
            if (err) {
                reject(err)
            } else {
                //console.log('commit data', data)
                resolve(data)
            }
        });
    })
}