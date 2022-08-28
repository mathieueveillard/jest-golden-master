/* eslint-disable no-console */
import * as fs from "fs";

type Scenario = () => Promise<void>;

export const DIRECTORY = "./golden-master";

const createDirectoryIfRequired = (): void => {
  if (!fs.existsSync(DIRECTORY)) {
    fs.mkdirSync(DIRECTORY);
  }
};

const generateFilePaths = (slug: string) => {
  return {
    master: `${DIRECTORY}/${slug}-master.txt`,
    actual: `${DIRECTORY}/${slug}-actual.txt`,
  };
};

const runScenario = async (filePath: string, scenario: Scenario): Promise<void> => {
  const loggingFunction = console.log;

  const teardown = () => {
    console.log = loggingFunction;
  };

  console.log = (text: string): void => {
    // eslint-disable-next-line prefer-template
    fs.appendFileSync(filePath, text + "\n");
  };

  await scenario();

  teardown();
};

const eraseFile = (path: string): void => {
  fs.writeFileSync(path, "");
};

const runGoldenMaster = async (slug: string, scenario: Scenario): Promise<void> => {
  createDirectoryIfRequired();

  const { master, actual } = generateFilePaths(slug);

  const createMaster = (): Promise<void> => {
    return runScenario(master, scenario);
  };

  const compareActualToMaster = async (): Promise<void> => {
    eraseFile(actual);
    await runScenario(actual, scenario);
    const masterContent = fs.readFileSync(master);
    const actualContent = fs.readFileSync(actual);
    expect(actualContent).toEqual(masterContent);
  };

  if (!fs.existsSync(master)) {
    await createMaster();
  } else {
    await compareActualToMaster();
  }
};

export default runGoldenMaster;
