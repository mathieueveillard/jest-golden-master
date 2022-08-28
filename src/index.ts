import * as fs from "fs";
import { diffArrays } from "diff";
import { Chalk } from "chalk";
const chalk = require("chalk");

export const DIRECTORY = "./golden-master";

type LoggingFunction = (text: string) => void;

type TeardownFunction = () => void;

type Scenario = () => Promise<void>;

type Line = string;

type LineStatus = "UNCHANGED_LINE" | "ADDITIONAL_LINE" | "MISSING_LINE";

type LineAnalysis = {
  type: LineStatus;
  line: Line;
};

const colorFunctions: Record<LineStatus, Chalk> = {
  UNCHANGED_LINE: chalk.gray,
  ADDITIONAL_LINE: chalk.greenBright,
  MISSING_LINE: chalk.redBright,
};

const explanations: Record<LineStatus, string> = {
  UNCHANGED_LINE: " ",
  ADDITIONAL_LINE: "+",
  MISSING_LINE: "-",
};

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

const getFileContent = (path: string): Line[] => {
  return fs.readFileSync(path).toString().split("\n");
};

const mapToLineStatus = ({ added, removed }: { added: boolean; removed: boolean }): LineStatus => {
  if (added) {
    return "ADDITIONAL_LINE";
  }
  if (removed) {
    return "MISSING_LINE";
  }
  return "UNCHANGED_LINE";
};

const compareFilesLineByLine =
  (master: string) =>
  (actual: string): LineAnalysis[] => {
    const masterContent = getFileContent(master);
    const actualContent = getFileContent(actual);
    return diffArrays(masterContent, actualContent)
      .map(({ added, removed, value }) => ({
        type: mapToLineStatus({ added: !!added, removed: !!removed }),
        lines: value,
      }))
      .map(({ type, lines }) => lines.map((line) => ({ type, line })))
      .flat();
  };

const testFails = (analysis: LineAnalysis[]): boolean => {
  return analysis.filter(({ type }) => type !== "UNCHANGED_LINE").length > 0;
};

const computeDisplayedDiff = (analysis: LineAnalysis[]): string => {
  const computeDisplayedLineAsPerStatus = ({ type, line }: LineAnalysis): string => {
    const explanation = explanations[type];
    const text = `${explanation} ${line}`;
    return colorFunctions[type](text);
  };
  return analysis.map(computeDisplayedLineAsPerStatus).join("\n");
};

const compareActualToMaster =
  (slug: string) =>
  (scenario: Scenario) =>
  (master: string) =>
  async (actual: string): Promise<void> => {
    eraseFile(actual);
    await runScenario(scenario)(actual);
    const diff = compareFilesLineByLine(master)(actual);
    if (testFails(diff)) {
      console.log(`
Golden Master test report
-------------------------
Test slug: ${chalk.inverse(slug)}
Master vs. actual logs:

${computeDisplayedDiff(diff)}
`);
      expect("Master and actual logs do NOT match.").toEqual("Master and actual logs match.");
    }
  };

const runGoldenMaster = async (slug: string, scenario: Scenario): Promise<void> => {
  createDirectoryIfRequired(DIRECTORY);

  const { master, actual } = generateFilePaths(DIRECTORY)(slug);

  if (!fs.existsSync(master)) {
    await createMaster(scenario)(master);
  } else {
    await compareActualToMaster(slug)(scenario)(master)(actual);
  }
};

export default runGoldenMaster;
