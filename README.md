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
  await runGoldenMaster(async () => {
    // Write your scenario here
    // Meaning: invoke the legacy codebase's API
    // All `console.log`s will be logged as per the Golden Master standards
  });
});
```
