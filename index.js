"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/* eslint-disable no-console */
var fs = require("fs");
var DIRECTORY = "./golden-master";
var createDirectoryIfRequired = function () {
    if (!fs.existsSync(DIRECTORY)) {
        fs.mkdirSync(DIRECTORY);
    }
};
var generateFilePaths = function (slug) {
    return {
        master: "".concat(DIRECTORY, "/").concat(slug, "-master.txt"),
        actual: "".concat(DIRECTORY, "/").concat(slug, "-actual.txt")
    };
};
var runScenario = function (filePath, scenario) { return __awaiter(void 0, void 0, void 0, function () {
    var teardown;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                teardown = function () {
                    console.log = console.log.bind(console);
                };
                console.log = function (text) {
                    // eslint-disable-next-line prefer-template
                    fs.appendFileSync(filePath, text + "\n");
                };
                return [4 /*yield*/, scenario()];
            case 1:
                _a.sent();
                teardown();
                return [2 /*return*/];
        }
    });
}); };
var eraseFile = function (path) {
    fs.writeFileSync(path, "");
};
var runGoldenMaster = function (slug, scenario) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, master, actual, createMaster, compareActualToMaster;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                createDirectoryIfRequired();
                _a = generateFilePaths(slug), master = _a.master, actual = _a.actual;
                createMaster = function () {
                    return runScenario(master, scenario);
                };
                compareActualToMaster = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                eraseFile(actual);
                                return [4 /*yield*/, runScenario(actual, scenario)];
                            case 1:
                                _a.sent();
                                expect(fs.readFileSync(actual)).toEqual(fs.readFileSync(master));
                                return [2 /*return*/];
                        }
                    });
                }); };
                if (!!fs.existsSync(master)) return [3 /*break*/, 2];
                return [4 /*yield*/, createMaster()];
            case 1:
                _b.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, compareActualToMaster()];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports["default"] = runGoldenMaster;
