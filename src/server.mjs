import os from 'node:os';
import { createApp } from './app.mjs';
import { config } from './config.mjs';

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`\n  Plosia ${config.version} is running\n`);
  console.log(`  Local:    http://localhost:${config.port}`);
  for (const ip of lanAddresses()) {
    console.log(`  Network:  http://${ip}:${config.port}`);
  }
  console.log('');
});

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}
