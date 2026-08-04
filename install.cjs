const { execSync } = require('child_process');
try {
  const result = execSync('npm.cmd install', {
    cwd: 'd:/Hospital_Roadmap',
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, npm_config_loglevel: 'error' }
  });
  console.log('INSTALL_SUCCESS');
  console.log(result);
} catch (e) {
  console.log('INSTALL_FAILED');
  if (e.stdout) console.log('STDOUT:', e.stdout);
  if (e.stderr) console.log('STDERR:', e.stderr);
  process.exit(1);
}
