const { spawn } = require('child_process');
const path = require('path');

// Ensure we are in the root directory
process.chdir(__dirname);

console.log('🚀 Starting EYER-REMS Production Environment...');

// 1. Run Prisma migrations
console.log('📡 Running database migrations...');
const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', shell: true });

migrate.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Migration failed with code ${code}. Continuing anyway...`);
  } else {
    console.log('✅ Migrations completed successfully.');
  }

  // 2. Start the Backend Server on port 3001
  console.log('📂 Starting Backend Server (Express) on port 3001...');
  const backend = spawn('npm', ['run', 'server:start'], { 
    stdio: 'inherit', 
    shell: true,
    env: { ...process.env, PORT: '3001', NODE_ENV: 'production' }
  });

  // 3. Start the Next.js Frontend on the Render-provided PORT
  console.log(`🌐 Starting Frontend Server (Next.js) on port ${process.env.PORT || 3000}...`);
  const frontend = spawn('npx', ['next', 'start', '-p', process.env.PORT || '3000'], { 
    stdio: 'inherit', 
    shell: true 
  });

  // Handle process termination
  process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
  });

  process.on('SIGTERM', () => {
    backend.kill();
    frontend.kill();
    process.exit();
  });
});
