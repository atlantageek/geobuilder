const { Client } = require('pg');
const { exec } = require('child_process');
var config = {
    user: 'postgres',
    host: '10.0.0.231',
    database: 'osm',
    password: 'postgres',
    port: 5432,
};
// PostgreSQL client configuration
const client = new Client(config);

(async () => {
    try {
        // Connect to the database
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Listen to a specific channel
        const channel = 'dumpdb'; // Replace with your channel name
        await client.query(`LISTEN ${channel}`);
        console.log(`Listening for notifications on channel: ${channel}`);

        // Handle notifications
        client.on('notification', (msg) => {
            console.log(`Received notification on channel ${msg.channel}:`, msg.payload);
            var command = `PGPASSWORD="${config.password}" pg_dump -U ${config.user} -h ${config.host}  -n ${msg.payload} ${config.database} > osm_dump.sql`;
            console.log(command);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing pg_dump: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`pg_dump stderr: ${stderr}`);
                    return;
                }
                console.log(`pg_dump stdout: ${stdout}`);

            });
        })
        // Keep the process running
        console.log('Waiting for notifications...');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();

// Handle cleanup on process exit
process.on('SIGINT', async () => {
    console.log('\nDisconnecting...');
    await client.end();
    process.exit(0);
});