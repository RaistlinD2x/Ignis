import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

interface StageConfig {
  stageName: string;
  account: string;
  region: string;
}

function loadEnvironmentConfig(): StageConfig[] {
  const configPath = path.join(__dirname, 'stages.yaml'); // Adjust path as needed
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as StageConfig[];
}

const stages = loadEnvironmentConfig();
export { stages };
