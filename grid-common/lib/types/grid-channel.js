module.exports = GridChannel


function GridChannel(name, implementation) {
    this.channelType = implementation;
    this.name = name;
    this.partitions = 1;
    this.consumerGroup = "NodeStreamApi"
}

GridChannel.of = function(name, channelType) {
    channelType = channelType || GridChannel.ChannelImplementations.Kafka
    return new GridChannel(name, channelType)
};

GridChannel.ChannelImplementations = {
    Kafka: "Kafka"
};

// NOTE: cannot auto-create topics with multiple partitions
//  (https://cwiki.apache.org/confluence/display/KAFKA/A+Guide+To+The+Kafka+Protocol#AGuideToTheKafkaProtocol-TopicMetadataRequest)
//  the topic metadata request only takes a string of topic names
GridChannel.prototype.setPartitions = function(partitions) {
    this.partitions = partitions
    return this
};

GridChannel.prototype.setConsumerGroup = function(consumerGroup) {
    this.consumerGroup = consumerGroup
    return this
};

GridChannel.prototype.getChannelType = function(pattern, channelName) {
    const notSupported = () => {
        throw new Error('Supplied pattern does not support channel type: ' + this.channelType)
    };

    const channelFunction = (pattern[this.channelType]) ?
        pattern[this.channelType] :notSupported

    return channelFunction(channelName)
};
