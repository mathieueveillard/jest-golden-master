type LoggingFunction = (text: string) => void;

type TeardownFunction = () => void;

type Scenario = () => Promise<void>;

const monkeyPatchConsoleLog = (patchFunction: LoggingFunction): TeardownFunction => {
  const log = console.log;

  const teardown = () => {
    console.log = log;
  };

  console.log = patchFunction;

  return teardown;
};

const runScenario = async (scenario: Scenario): Promise<string[]> => {
  const logs = [];

  const teardown = monkeyPatchConsoleLog((text: string): void => {
    logs.push(text);
  });

  await scenario();

  teardown();

  return logs;
};

const runGoldenMaster = async (scenario: Scenario): Promise<void> => {
  const result = await runScenario(scenario);
  expect(result).toMatchSnapshot();
};

export default runGoldenMaster;
