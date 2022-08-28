import * as fs from "fs";

export const DIRECTORY = "./golden-master";

type LoggingFunction = (text: string) => void;

type TeardownFunction = () => void;

type Scenario = () => Promise<void>;

const createDirectoryIfRequired = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const generateFilePaths = (directory: string) => (slug: string) => {
  return {
    master: `${directory}/${slug}-master.txt`,
    actual: `${directory}/${slug}-actual.txt`,
  };
};

const monkeyPatchConsoleLog = (patchFunction: LoggingFunction): TeardownFunction => {
  const log = console.log;

  const teardown = () => {
    console.log = log;
  };

  console.log = patchFunction;

  return teardown;
};

const runScenario =
  (scenario: Scenario) =>
  async (filePath: string): Promise<void> => {
    const teardown = monkeyPatchConsoleLog((text: string): void => {
      fs.appendFileSync(filePath, text + "\n");
    });

    await scenario();

    teardown();
  };

const eraseFile = (path: string): void => {
  fs.writeFileSync(path, "");
};

const createMaster =
  (scenario: Scenario) =>
  (master: string): Promise<void> => {
    return runScenario(scenario)(master);
  };

const compareActualToMaster =
  (scenario: Scenario) =>
  (master: string) =>
  async (actual: string): Promise<void> => {
    eraseFile(actual);
    await runScenario(scenario)(actual);
    const masterContent = fs.readFileSync(master);
    const actualContent = fs.readFileSync(actual);
    expect(actualContent).toEqual(masterContent);
  };

const runGoldenMaster = async (slug: string, scenario: Scenario): Promise<void> => {
  createDirectoryIfRequired(DIRECTORY);

  const { master, actual } = generateFilePaths(DIRECTORY)(slug);

  if (!fs.existsSync(master)) {
    await createMaster(scenario)(master);
  } else {
    await compareActualToMaster(scenario)(master)(actual);
  }
};

export default runGoldenMaster;
