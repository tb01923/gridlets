"use strict"
const kafka = require('kafka-node');

const client = new kafka.Client('hqdevzoo01:2181');
const Consumer = kafka.Consumer;
const producer = new kafka.Producer(client);

let ready = false;
producer.on('ready', function () {
    ready = true;
});
const send = function(topic, message) {
    const _send = function() {
        producer.send([{topic: topic, messages: message}], function(err, result){
            if(err) {
                console.error('send:', err)
            } else {
                console.log('send:', result)
            }

        });
    }

    if (ready) {
        _send()
    }
    else {
        producer.on('ready', function () {
            _send()
        });
    }
}


const listen = function(topics, consumerGroup) {
    const options = undefined || {groupId: consumerGroup}
    const consumer = new Consumer(client, topics, options);
    return consumer
}

listen([{topic: 'step1_channelOut', partition: 0}], 'testCG').on('message', function(obj){
    console.log('ping', obj.value)
})


let i = 0
setInterval(function(){
    send('step1_channelOut', i++)
}, 2000)

