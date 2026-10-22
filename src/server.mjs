import os from 'node:os';
import { createApp } from './app.mjs';
import { config } from './config.mjs';

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`\n  Plosia ${config.version} запущена\n`);
  console.log(`  Локально:  http://localhost:${config.port}`);
  for (const ip of lanAddresses()) {
    console.log(`  В сети:    http://${ip}:${config.port}`);
  }
  console.log(`\n  Страница воркшопа: http://localhost:${config.port}/workshop\n`);
});

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}
