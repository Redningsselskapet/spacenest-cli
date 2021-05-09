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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestApp = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var createNestApp = function (path) {
    var cmd = "npx @nestjs/cli new -gs " + path;
    child_process_1.execSync(cmd);
    // Add controlller
    var appController = "\nimport { Controller, Get } from '@nestjs/common';\n\n@Controller()\nexport class AppController {\n  \n  @Get('/')\n  showConfig() {\n    return {\n      name: process.env.npm_package_name,\n      version: process.env.npm_package_version,\n    };\n  }\n}\n";
    fs_1.writeFileSync(path + "/src/app.controller.ts", appController);
    // add devspace to scripts section of package.json
    var packageJson = JSON.parse(fs_1.readFileSync(path + "/package.json", "utf-8"));
    var packageJsonPartly = {
        scripts: {
            "devspace:build": "devspace build",
            "devspace:deploy": "devspace deploy",
        },
    };
    var scripts = __assign(__assign({}, packageJson.scripts), {
        "devspace:build": "devspace build",
        "devspace:deploy": "devspace deploy",
        "devspace:purge": "devspace purge"
    });
    packageJson.scripts = scripts;
    fs_1.writeFileSync(path + "/package.json", JSON.stringify(packageJson, null, 2), { encoding: "utf-8" });
};
exports.createNestApp = createNestApp;
