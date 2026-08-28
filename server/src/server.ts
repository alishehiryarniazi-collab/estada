/**
 * Server entry point. Creates the HTTP server, attaches Socket.IO for real-time
 * chat, starts background schedulers, and wires graceful shutdown.
 */
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { initSocket } from './socket.js';
import { startSchedulers } from './services/scheduler.js';

const app = createApp();
const server = createServer(app);

// Real-time chat.
initSocket(server);

server.listen(env.PORT, () => {
  console.info(`🚀 Estada API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  // Background jobs (auto-expiry, etc.).
  startSchedulers();
});

async function shutdown(signal: string) {
  console.info(`\n${signal} received — shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
