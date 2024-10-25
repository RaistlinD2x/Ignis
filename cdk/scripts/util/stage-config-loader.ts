import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface StageConfig {
  stageName: string;
  account: string;
  region: string;
}

// Load the YAML file
const stagesYaml = fs.readFileSync('./scripts/util/stages.yaml', 'utf8');

// Parse the YAML file
const config = yaml.load(stagesYaml) as { stages: StageConfig[] };

// Export the stages array (by accessing the stages property)
const stages = config.stages;

export { stages };
