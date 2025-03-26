// Import the MQTT library
const mqtt = require('mqtt');

// MQTT Broker Configuration
const EC2_BROKER_IP = '13.235.76.52';
const MQTT_PORT = 1883;

const options = {
    host: EC2_BROKER_IP,
    port: MQTT_PORT,
    protocol: 'mqtt',
    keepalive: 30,           // Keep connection alive for 30 seconds
    reconnectPeriod: 1000,   // Reconnect every 1 second if disconnected
    clean: true,             // Clean session on connect
    connectTimeout: 10000,   // 10 seconds timeout for initial connection
    username: 'Sarayu',
    password: 'IOTteam@123',
};

// Initialize MQTT client
const client = mqtt.connect(options);

// Array of tag names for topics
const tagNames = [
    'companyone',
    'companytwo',
    'companythree',
    'companyfour',
    'companyfive',
    'companysix',
];

// Function to generate and publish messages
function publishMessages() {
    const messages = [];

    // Generate topics and random messages
    tagNames.forEach(tag => {
        for (let i = 1; i <= 25; i++) {
            const topic = `${tag}/d1/topic${i}|m/s`;
            const message = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
            messages.push({ topic, message: message.toString() });
        }
    });

    // Publish all messages
    messages.forEach(({ topic, message }) => {
        client.publish(topic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error(`Failed to publish on ${topic}:`, err);
            }
        });
    });

    console.log(`Published ${messages.length} messages across ${tagNames.length} tags`);
}

// Event: Successful connection to MQTT broker
client.on('connect', () => {
    console.log(`Connected to Mosquitto MQTT Broker at ${EC2_BROKER_IP}:${MQTT_PORT}`);

    // Start publishing messages every 10 seconds
    setInterval(publishMessages, 10 * 1000);
});

// Event: Handle connection errors
client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
    process.exit(1); // Exit with error code to signal PM2 to restart
});

// Event: Reconnection attempts
client.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT broker...');
});

// Event: Connection closed
client.on('close', () => {
    console.log('MQTT connection closed');
});

// Event: Client goes offline
client.on('offline', () => {
    console.log('MQTT client is offline');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing MQTT connection...');
    client.end(() => {
        console.log('MQTT client disconnected. Exiting...');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    client.end(() => {
        process.exit(1);
    });
});