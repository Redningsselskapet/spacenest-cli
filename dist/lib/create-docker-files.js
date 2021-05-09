"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDockerFiles = void 0;
var fs_1 = require("fs");
var createDockerFiles = function (path) {
    // Add Dockerfile, .ignoredockerfile
    var dockerfile = "\nFROM node:14-alpine\nWORKDIR /dist\nCOPY package.json .\nRUN npm install \nCOPY . .\nRUN npm run build\nCMD [\"npm\", \"run\", \"start:prod\"]\n";
    var dockerignore = "\nnode_modules\ndist\n";
    fs_1.writeFileSync(path + "/Dockerfile", dockerfile);
    fs_1.writeFileSync(path + "/.dockerignore", dockerignore);
};
exports.createDockerFiles = createDockerFiles;
