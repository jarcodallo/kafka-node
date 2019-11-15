function consoleLoggerProvider (name) {
  // do something with the name
  return {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
}

const kafkaLogging = require('../../lib/logging');
kafkaLogging.setLoggerProvider(consoleLoggerProvider);

/**
 * Module dependencies
 */
const uuid = require('uuid');
const ConsumerGroup = require('../../lib/consumerGroup');

// Test
const run = async () => {
  const topic = 'kafka-test-same-groupId';
  const consumerGroupOptions = {
    kafkaHost: 'kafka:9092',
    id: `kafka.consumer-group.client.test.1.${uuid.v4()}`,
    groupId: 'kafka-test-group',
    connectOnReady: true,
    protocol: ['roundrobin'],
    fromOffset: 'latest',
    outOfRangeOffset: 'latest',
    commitOffsetsOnFirstJoin: true,
    sessionTimeout: 30000,
    heartbeatInterval: 2000,
    retries: 100,
    retryFactor: 2,
    retryMinTimeout: 500,
    autoCommit: true,
    autoCommitIntervalMs: 500,
    fetchMaxWaitMs: 100,
    fetchMinBytes: 1,
    fetchMaxBytes: 10485760,
    encoding: 'utf8',
    // monitor consumer re-balance.
    onRebalance: (isAlreadyMember, cb) => {
      console.log(`onRebalance isAlreadyMember: ${isAlreadyMember}`);
      cb();
    }
  };

  const consumerGroup = new ConsumerGroup(
    consumerGroupOptions,
    [topic]
  );

  consumerGroup.on('connect', () => {
    console.log('ConsumerGroup connected');
  });

  consumerGroup.on('error', (error) => {
    console.log('ConsumerGroup error', error);
  });

  consumerGroup.on('reconnect', () => {
    console.log('ConsumerGroup reconnect');
  });

  consumerGroup.on('brokersChanged', () => {
    console.log('ConsumerGroup brokersChanged');
  });

  consumerGroup.on('message', (message) => {
    console.log('ConsumerGroup with message', message);
  });
};

run().catch(console.error);
