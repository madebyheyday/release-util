"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var shell = require("shelljs");
var chalk_1 = require("chalk");
var semanticRelease = require("semantic-release");
var semantic_release_1 = require("../base/semantic-release");
var getPlugins_1 = require("../base/getPlugins");
/**
 * Create semantic release:
 * - Updates Changelog
 * - Bumps package.json version
 * - Commits and pushes package.json and Changelog
 */
function executeSemanticRelease(dryRun) {
    if (dryRun === void 0) { dryRun = false; }
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(chalk_1["default"].white('[release] Starting semantic release...'));
                    return [4 /*yield*/, semanticRelease(__assign(__assign({}, semantic_release_1.getSemanticReleaseOptions()), { dryRun: dryRun }))];
                case 1:
                    result = _a.sent();
                    if (!result || result.lastRelease.version === result.nextRelease.version) {
                        console.log(chalk_1["default"].yellow('[release] No release created'));
                        return [2 /*return*/, false];
                    }
                    console.log(chalk_1["default"].greenBright("[release] Release created: " + result.nextRelease.version));
                    return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Netlify only clones the repo as a shallow copy. If we're in a Netlify build context, the current working branch reported by Git will be != process.env.BRANCH reported by Netlify.
 * We will need to switch to the real branch first to make a release commit in the process.env.BRANCH branch.
 * The commit we're releasing for is provided by Netlify in env.COMMIT_REF, so we will also reset the build branch to this commit
 *
 * !Warning! Don't try this locally - this will meddle with your local git repo!
 * If you absolutely must enforce using this locally (by setting env.NETLIFY, env.BRANCH and env.COMMIT_REF):
 * Always explicitly reset the release branch to HEAD and switch back to our working branch afterwards.
 * Seriously.
 */
function handleNetlifyGitSetup() {
    // only operate in Netlify build context
    if (!process.env.NETLIFY || !process.env.BRANCH || !process.env.COMMIT_REF)
        return;
    // working dir branch = branch reported by git (in Netlify this will be a commit, not a branch)
    var workdirBranch = shell
        .exec('git rev-parse --abbrev-ref HEAD', { silent: true })
        .toString()
        .replace(/(\n|\r)/, '');
    // build branch as provided in env by Netlify, working dir branch as a fallback (= working dir is on a real branch)
    var buildBranch = process.env.BRANCH || workdirBranch;
    // ! Kids, don't try this at home - this will meddle with your local git repo!
    // !
    if (workdirBranch !== buildBranch) {
        // env.BRANCH is different from what Git reports as being the current branch
        shell.exec("git branch -f " + buildBranch + " " + process.env.COMMIT_REF, { silent: true });
        shell.exec("git checkout " + buildBranch, { silent: true });
    }
}
function release(dryRun) {
    if (dryRun === void 0) { dryRun = false; }
    return __awaiter(this, void 0, void 0, function () {
        var checks, releaseCreated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    handleNetlifyGitSetup();
                    return [4 /*yield*/, Promise.all(getPlugins_1["default"]().map(function (plugin) {
                            return plugin.beforeRelease(dryRun);
                        }))];
                case 1:
                    checks = _a.sent();
                    if (checks.includes(false)) {
                        console.log('[release] Release Prevented by plugin');
                    }
                    return [4 /*yield*/, executeSemanticRelease(dryRun)];
                case 2:
                    releaseCreated = _a.sent();
                    if (!releaseCreated) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.all(getPlugins_1["default"]().map(function (plugin) {
                            return plugin.afterRelease(dryRun);
                        }))];
                case 3:
                    _a.sent();
                    console.log('[release] Finished');
                    process.exit();
                    return [3 /*break*/, 5];
                case 4:
                    console.log('[release] Nothing to do');
                    process.exit(1);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = release;