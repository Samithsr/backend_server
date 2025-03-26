const mqtt = require('mqtt'); 

const EC2_BROKER_IP = '13.235.76.52';
const MQTT_PORT = 1883;

const options = {
    host: EC2_BROKER_IP, 
    port: 1883, 
    protocol: 'mqtt',
    keepalive: 30,
    reconnectPeriod: 1000,
    clean: true,
    connectTimeout: 10000,
    username: 'Sarayu',
    password: 'IOTteam@123',
  };

const client = mqtt.connect(options);

client.on('connect', () => {
    console.log(`Connected to Mosquitto MQTT Broker at ${EC2_BROKER_IP}:${MQTT_PORT}`);

    const tagNames = ['companyone','companytwo', 'companythree', 'companyfour', 'companyfive', 'companysix'];

    setInterval(() => {
        const messages = [];
        
        tagNames.forEach(tag => {
            for (let i = 1; i <= 25; i++) {
                const topic = `${tag}/d1/topic${i}|m/s`;
                const message = Math.floor(Math.random() * 100) + 1; 
                messages.push({ topic, message: message.toString() });
            }
        });

        messages.forEach(({ topic, message }) => {
            client.publish(topic, message, { qos: 1 }, (err) => {
                if (err) {
                    console.error(`Failed to publish on ${topic}:`, err);
                }
            });
        });

        console.log(`Published ${messages.length} messages across ${tagNames.length} tags`);
    }, 1000 * 10); 
});

client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
});

client.on('reconnect', () => {
    console.log('Attempting to reconnect...');
});

client.on('close', () => {
    console.log('MQTT connection closed');
});

client.on('offline', () => {
    console.log('MQTT client is offline');
});