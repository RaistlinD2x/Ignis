// parseConfig.js

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Define the path to your config.yaml file
const configPath = path.resolve(__dirname, '..', 'config.yaml');

try {
  // Load and parse the YAML config file
  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

  // Extract environments array from the config
  const environments = config.environments;

  // Check if environments exist
  if (!environments || environments.length === 0) {
    console.error('No environments found in the config file.');
    process.exit(1);
  }

  // Output each environment as space-separated values (envName, account, region)
  environments.forEach(env => {
    console.log(`${env.envName} ${env.account} ${env.region}`);
  });

} catch (error) {
  console.error('Error reading or parsing the config.yaml file:', error.message);
  process.exit(1);
}
