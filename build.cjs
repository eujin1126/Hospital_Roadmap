const { execSync } = require('child_process');
try {
  const result = execSync('npm.cmd run build', {
    cwd: 'd:/Hospital_Roadmap',
    encoding: 'utf8',
    timeout: 60000
  });
  console.log('BUILD_SUCCESS');
  console.log(result);
} catch (e) {
  console.log('BUILD_FAILED');
  if (e.stdout) console.log(e.stdout);
  if (e.stderr) console.log(e.stderr);
}
