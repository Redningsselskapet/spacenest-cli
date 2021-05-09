#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_root_path_1 = __importDefault(require("app-root-path"));
var fs_1 = require("fs");
var yargs_1 = require("yargs");
var create_devspace_1 = require("./lib/create-devspace");
var create_docker_files_1 = require("./lib/create-docker-files");
var create_k8s_1 = require("./lib/create-k8s");
var create_nest_app_1 = require("./lib/create-nest-app");
var read_config_1 = require("./lib/read-config");
var rootPath = app_root_path_1.default.path;
var spaceNestConfigPath = rootPath + "/spacenest.config.json";
// Read config from spacenest.config.json
var config = read_config_1.readSpaceNestConfig(spaceNestConfigPath);
// Read and check input parameters
var argv = yargs_1.command("name", "package name", {
    name: {
        description: "Name of the package",
        alias: "n",
    },
})
    .option("directory", {
    alias: "d",
    description: "Relative path to the package folder",
})
    .help()
    .alias("help", "h")
    .check(function (argv) {
    if (argv._.length !== 1)
        throw new Error("Argumnet check failed");
    if (fs_1.existsSync(argv.directory + "/" + argv._[0].toString()))
        throw new Error("Argumnet check failed: A package with that name exists");
    return true;
}).argv;
var pkgDirectory = argv.directory || 'packages';
var pkgName = argv._[0];
// Add nestjs package
create_nest_app_1.createNestApp(pkgDirectory + "/" + pkgName);
// Add docker
create_docker_files_1.createDockerFiles(pkgDirectory + "/" + pkgName);
// Add spacedev configuration
create_devspace_1.createDevSpace(pkgName, pkgDirectory, config);
// add k8s infrastructure
create_k8s_1.createK8s(pkgName, pkgDirectory, config);
console.log(pkgName + " created! \uD83D\uDCE6");
