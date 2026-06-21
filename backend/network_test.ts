import dns from 'node:dns';
import net from 'node:net';

const shard = "ac-u72rgvj-shard-00-00.f5nmj43.mongodb.net";
const port = 27017;

console.log(`--- Network Diagnostic for MongoDB Atlas ---`);

console.log(`1. Testing DNS resolution for ${shard}...`);
dns.lookup(shard, (err, address) => {
  if (err) {
    console.error(`   ❌ DNS Failed: ${err.message}`);
    console.error(`   TIP: Check your internet connection or DNS settings.`);
  } else {
    console.log(`   ✅ DNS OK: ${address}`);
    
    console.log(`2. Testing Port Connectivity (Port ${port})...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`   ✅ Port ${port} is OPEN! Your laptop can reach the Atlas server.`);
      console.log(`\nCONCLUSION: If the port is open but Mongoose still fails, your IP is almost certainly BLOCKED by the Atlas Whitelist.`);
      socket.destroy();
    });
    
    socket.on('timeout', () => {
      console.log(`   ❌ Port ${port} TIMED OUT. The server is unreachable.`);
      console.log(`\nCONCLUSION: Your firewall, ISP, or a VPN is likely blocking the MongoDB port (27017).`);
      socket.destroy();
    });
    
    socket.on('error', (e) => {
      console.log(`   ❌ Port ${port} ERROR: ${e.message}`);
      socket.destroy();
    });
    
    socket.connect(port, shard);
  }
});
