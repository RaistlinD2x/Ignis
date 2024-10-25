import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path'

interface StageConfig {
  stageName: string;
  account: string;
  region: string;
}

// Use path.resolve to construct the absolute path from the root directory
const stagesYaml = fs.readFileSync(path.resolve(__dirname, '../../scripts/util/stages.yaml'), 'utf8');


// Parse the YAML file
const config = yaml.load(stagesYaml) as { stages: StageConfig[] };

// Export the stages array (by accessing the stages property)
const stages = config.stages;

export { stages };
