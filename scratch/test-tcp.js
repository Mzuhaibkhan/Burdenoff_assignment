const net = require('net');

const client = new net.Socket();
client.connect(5433, '127.0.0.1', function() {
    console.log('Connected to 127.0.0.1:5433');
    client.destroy();
});

client.on('error', function(err) {
    console.error('Connection to 127.0.0.1 failed: ' + err.message);
});

const client2 = new net.Socket();
client2.connect(5433, 'localhost', function() {
    console.log('Connected to localhost:5433');
    client2.destroy();
});

client2.on('error', function(err) {
    console.error('Connection to localhost failed: ' + err.message);
});
