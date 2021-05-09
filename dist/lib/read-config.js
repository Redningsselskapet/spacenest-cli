"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSpaceNestConfig = void 0;
var fs_1 = require("fs");
var readSpaceNestConfig = function (path) {
    return JSON.parse(fs_1.readFileSync(path, "utf-8"));
};
exports.readSpaceNestConfig = readSpaceNestConfig;
