# jest-golden-master

## What is it?

`jest-golden-master` helps writing tests as per the [Golden Master](https://www.google.com/search?q=golden+master+refactoring&sxsrf=ALiCzsY8mefjPM8mEJOkP_F7fOmabOA3bg%3A1657110628713&ei=ZIDFYpyVK8GGlwT087-QCQ&oq=golden+master+refa&gs_lcp=Cgdnd3Mtd2l6EAMYADIFCAAQywE6BwgAEEcQsAM6BwgAELADEEM6BAgAEEM6CwguEIAEEMcBEK8BOgUIABCABDoGCAAQHhAWSgQIQRgASgQIRhgAUOoCWNQGYNgMaAFwAXgAgAFmiAHOA5IBAzMuMpgBAKABAcgBCsABAQ&sclient=gws-wiz) refactoring method ⚙️ 🧰 🔧

## How does it work?

`jest-golden-master` monckey-patches the native `console.log` method 🙉 🙈

## Getting started

```
npm install -D jest-golden-master
```

`jest-golden-master` exports a single `runGoldenMaster` function to be used within a test. This way, the library seamlessly integrates with Jest 🫶 💙

```typescript
import runGoldenMaster from "jest-golden-master";

test("Test name", async () => {
  await runGoldenMaster("test-slug", async () => {
    // Write your scenario here
    // Meaning: invoke the legacy codebase's API
    // All `console.log`s will be logged as per the Golden Master standards
  });
});
```

The test slug will be used for naming files, hence usual naming constraints apply. [Kebab case](https://www.google.com/search?q=kebab+case&oq=kebab+case&aqs=chrome..69i57j0i512l2j0i20i263i512j0i512l2j69i60l2.1461j0j4&sourceid=chrome&ie=UTF-8) is suggested, not mandatory.

## An example

This is the [Trivia](https://github.com/mathieueveillard/trivia) legacy codebase. Much refactoring is needed, right? Here the codebase already logs many useful informations, but one can add as many `console.log` as they want.

```typescript
/* eslint-disable */
export class Game {
  private players: Array<string> = [];
  private places: Array<number> = [];
  private purses: Array<number> = [];
  private inPenaltyBox: Array<boolean> = [];
  private currentPlayer: number = 0;
  private isGettingOutOfPenaltyBox: boolean = false;

  private popQuestions: Array<string> = [];
  private scienceQuestions: Array<string> = [];
  private sportsQuestions: Array<string> = [];
  private rockQuestions: Array<string> = [];

  constructor() {
    for (let i = 0; i < 50; i++) {
      this.popQuestions.push("Pop Question " + i);
      this.scienceQuestions.push("Science Question " + i);
      this.sportsQuestions.push("Sports Question " + i);
      this.rockQuestions.push(this.createRockQuestion(i));
    }
  }

  private createRockQuestion(index: number): string {
    return "Rock Question " + index;
  }

  public add(name: string): boolean {
    this.players.push(name);
    this.places[this.howManyPlayers() - 1] = 0;
    this.purses[this.howManyPlayers() - 1] = 0;
    this.inPenaltyBox[this.howManyPlayers() - 1] = false;

    console.log(name + " was added");
    console.log("They are player number " + this.players.length);

    return true;
  }

  private howManyPlayers(): number {
    return this.players.length;
  }

  public roll(roll: number) {
    console.log(this.players[this.currentPlayer] + " is the current player");
    console.log("They have rolled a " + roll);

    if (this.inPenaltyBox[this.currentPlayer]) {
      if (roll % 2 != 0) {
        this.isGettingOutOfPenaltyBox = true;

        console.log(this.players[this.currentPlayer] + " is getting out of the penalty box");
        this.places[this.currentPlayer] = this.places[this.currentPlayer] + roll;
        if (this.places[this.currentPlayer] > 11) {
          this.places[this.currentPlayer] = this.places[this.currentPlayer] - 12;
        }

        console.log(this.players[this.currentPlayer] + "'s new location is " + this.places[this.currentPlayer]);
        console.log("The category is " + this.currentCategory());
        this.askQuestion();
      } else {
        console.log(this.players[this.currentPlayer] + " is not getting out of the penalty box");
        this.isGettingOutOfPenaltyBox = false;
      }
    } else {
      this.places[this.currentPlayer] = this.places[this.currentPlayer] + roll;
      if (this.places[this.currentPlayer] > 11) {
        this.places[this.currentPlayer] = this.places[this.currentPlayer] - 12;
      }

      console.log(this.players[this.currentPlayer] + "'s new location is " + this.places[this.currentPlayer]);
      console.log("The category is " + this.currentCategory());
      this.askQuestion();
    }
  }

  private askQuestion(): void {
    if (this.currentCategory() == "Pop") console.log(this.popQuestions.shift());
    if (this.currentCategory() == "Science") console.log(this.scienceQuestions.shift());
    if (this.currentCategory() == "Sports") console.log(this.sportsQuestions.shift());
    if (this.currentCategory() == "Rock") console.log(this.rockQuestions.shift());
  }

  private currentCategory(): string {
    if (this.places[this.currentPlayer] == 0) return "Pop";
    if (this.places[this.currentPlayer] == 4) return "Pop";
    if (this.places[this.currentPlayer] == 8) return "Pop";
    if (this.places[this.currentPlayer] == 1) return "Science";
    if (this.places[this.currentPlayer] == 5) return "Science";
    if (this.places[this.currentPlayer] == 9) return "Science";
    if (this.places[this.currentPlayer] == 2) return "Sports";
    if (this.places[this.currentPlayer] == 6) return "Sports";
    if (this.places[this.currentPlayer] == 10) return "Sports";
    return "Rock";
  }

  private didPlayerWin(): boolean {
    return !(this.purses[this.currentPlayer] == 6);
  }

  public wrongAnswer(): boolean {
    console.log("Question was incorrectly answered");
    console.log(this.players[this.currentPlayer] + " was sent to the penalty box");
    this.inPenaltyBox[this.currentPlayer] = true;

    this.currentPlayer += 1;
    if (this.currentPlayer == this.players.length) this.currentPlayer = 0;
    return true;
  }

  public wasCorrectlyAnswered(): boolean {
    if (this.inPenaltyBox[this.currentPlayer]) {
      if (this.isGettingOutOfPenaltyBox) {
        console.log("Answer was correct!!!!");
        this.purses[this.currentPlayer] += 1;
        console.log(this.players[this.currentPlayer] + " now has " + this.purses[this.currentPlayer] + " Gold Coins.");

        var winner = this.didPlayerWin();
        this.currentPlayer += 1;
        if (this.currentPlayer == this.players.length) this.currentPlayer = 0;

        return winner;
      } else {
        this.currentPlayer += 1;
        if (this.currentPlayer == this.players.length) this.currentPlayer = 0;
        return true;
      }
    } else {
      console.log("Answer was correct!!!!");

      this.purses[this.currentPlayer] += 1;
      console.log(this.players[this.currentPlayer] + " now has " + this.purses[this.currentPlayer] + " Gold Coins.");

      var winner = this.didPlayerWin();

      this.currentPlayer += 1;
      if (this.currentPlayer == this.players.length) this.currentPlayer = 0;

      return winner;
    }
  }
}
```

Now let's write a first scenario:

```typescript
import runGoldenMaster from "jest-golden-master";

test("2 players, only correct answers", async () => {
  await runGoldenMaster("only-correct-answers", async () => {
    const game = new Game();
    game.add("Anna");
    game.add("Thomas");
    game.roll(1); // Anna
    game.wasCorrectlyAnswered();
    game.roll(1); // Thomas
    game.wasCorrectlyAnswered();
    game.roll(1); // Anna
    game.wasCorrectlyAnswered();
  });
});
```

The first time the test is run, a `golden-master/only-correct-answers-master.txt` file is created.

```text
Anna was added
They are player number 1
Thomas was added
They are player number 2
Anna is the current player
They have rolled a 1
Anna's new location is 1
The category is Science
Science Question 0
Answer was correct!!!!
Anna now has 1 Gold Coins.
Thomas is the current player
They have rolled a 1
Thomas's new location is 1
The category is Science
Science Question 1
Answer was correct!!!!
Thomas now has 1 Gold Coins.
Anna is the current player
They have rolled a 1
Anna's new location is 2
The category is Sports
Sports Question 0
Answer was correct!!!!
Anna now has 2 Gold Coins.
```

Now let's proceed to a first refactoring.

The second time the test is run, a `golden-master/only-correct-answers-actual.txt` file is created. If its content exactly equals the master, the test succeeds. Otherwise, it fails.

## Help needed!

Contributions are much welcomed 🙏

Some ideas of features:

- Writting a scenario usually requires many iterations. During those iterations, it is normal to update the master, while later, during the refactoring step, the master should not change (by definition). Hence there should be 2 modes, something like `MASTER_DEFINITION` and `REFACTORING`;
- Basic configuration, e.g. the output directory;
- Improve the comparison between master and actual logs.
