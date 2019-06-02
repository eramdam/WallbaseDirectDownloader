const zip = require('bestzip');
const packageJson = require('./package.json');

zip({
  source: '*',
  destination: `../artifacts/build-${packageJson.version}.zip`,
  cwd: './dist'
})
  .then(function() {
    console.log('all done!');
  })
  .catch(function(err) {
    console.error(err.stack);
    process.exit(1);
  });
