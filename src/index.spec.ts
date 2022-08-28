import * as fs from "fs";
import runGoldenMaster, { DIRECTORY } from ".";

const clearAllFiles = (): void => {
  fs.rmSync(DIRECTORY, { recursive: true, force: true });
};

describe("Test of runGoldenMaster()", () => {
  afterEach(clearAllFiles);

  test("A master should be created on the first test launch", async () => {
    // GIVEN
    // WHEN
    await runGoldenMaster("master-creation", async () => {
      console.log("Test content, not relevant here.");
    });

    // THEN
    expect(fs.existsSync(`${DIRECTORY}/master-creation-master.txt`)).toEqual(true);
  });

  test("The actual file should be compared to the master on the second launch (successful refactoring)", async () => {
    // GIVEN
    await runGoldenMaster("comparison-to-master", async () => {
      console.log("Successful refactoring (no regression)");
    });

    // WHEN
    // THEN
    await runGoldenMaster("comparison-to-master", async () => {
      console.log("Successful refactoring (no regression)");
    });
    expect(fs.existsSync(`${DIRECTORY}/comparison-to-master-actual.txt`)).toEqual(true);
  });

  test("The actual file should be compared to the master on the second launch (unsuccessful refactoring)", async () => {
    // GIVEN
    await runGoldenMaster("comparison-to-master", async () => {
      console.log("Test content.");
    });

    // WHEN
    // THEN
    expect(() =>
      runGoldenMaster("comparison-to-master", async () => {
        console.log("Another test content. Unsuccessful refactoring (regression).");
      })
    ).rejects.toThrow();
    expect(fs.existsSync(`${DIRECTORY}/comparison-to-master-actual.txt`)).toEqual(true);
  });

  test("Better comparison between master and actual files: missing lines", async () => {
    // GIVEN
    await runGoldenMaster("missing-lines", async () => {
      console.log("First line");
      console.log("Second line");
      console.log("Third line");
      console.log("Fourth line");
    });

    // WHEN
    // THEN
    expect(() =>
      runGoldenMaster("missing-lines", async () => {
        console.log("First line");
        console.log("Fourth line");
      })
    ).rejects.toThrow();
    expect(fs.existsSync(`${DIRECTORY}/missing-lines-actual.txt`)).toEqual(true);
  });

  test("Better comparison between master and actual files: additional lines", async () => {
    // GIVEN
    await runGoldenMaster("additional-lines", async () => {
      console.log("First line");
      console.log("Second line");
    });

    // WHEN
    // THEN
    expect(() =>
      runGoldenMaster("additional-lines", async () => {
        console.log("First line");
        console.log("Intermediary line 1");
        console.log("Intermediary line 2");
        console.log("Second line");
      })
    ).rejects.toThrow();
    expect(fs.existsSync(`${DIRECTORY}/additional-lines-actual.txt`)).toEqual(true);
  });

  test("Better comparison between master and actual files: a line is replaced", async () => {
    // GIVEN
    await runGoldenMaster("a-line-is-replaced", async () => {
      console.log("First line");
      console.log("Second line");
      console.log("Third line");
    });

    // WHEN
    // THEN
    expect(() =>
      runGoldenMaster("a-line-is-replaced", async () => {
        console.log("First line");
        console.log("Another second line");
        console.log("Third line");
      })
    ).rejects.toThrow();
    expect(fs.existsSync(`${DIRECTORY}/a-line-is-replaced-actual.txt`)).toEqual(true);
  });

  test("Monkey patching: console.log should be assigned its ignitial value after test", async () => {
    // GIVEN
    const log = console.log;
    await runGoldenMaster("monkey-patching", async () => {
      console.log("Successful refactoring (no regression)");
    });

    // WHEN
    await runGoldenMaster("monkey-patching", async () => {
      console.log("Successful refactoring (no regression)");
    });

    // THEN
    expect(console.log).toBe(log);
  });
});
