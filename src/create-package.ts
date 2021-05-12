#!/usr/bin/env node
import appRootPath from "app-root-path";
import { existsSync } from "fs";
import { boolean, command } from "yargs";
import { createDevSpace } from "./lib/create-devspace";
import { createDockerFiles } from "./lib/create-docker-files";
import { createK8s } from "./lib/create-k8s";
import { createNestApp } from "./lib/create-nest-app";
import { getSpaceNestConfig, SpaceNestConfig } from "./lib/get-spacenest-config";

// Read and check input parameters
const argv = command("name", "package name", {
  name: {
    description: "Name of the package",
  },
})
  .option("directory", {
    description: "Relative path to the package folder",
    default: 'packages'
  })
  .option("conatainer-registry", {
    description: "Use container registry",
    default: ''
  })
  .option('create-pull-secret', {
    description: 'Create pull secret',
    default: false
  })
  .option('db', {
    description: 'Deploy database (default: none, other: mysql, postgresql, mongodb)'
  })
  .help()
  .alias("help", "h")
  .check((argv) => {
    if (argv._.length !== 1) throw new Error("Argumnet check failed");
    if (existsSync(`${argv.directory}/${argv._[0] as string}`))
      throw new Error("Argumnet check failed: A package with that name exists");
    return true;
  }).argv;

// Search for spacenest.config.json
const config = getSpaceNestConfig()

// override spaceconfig with console parameters
config.containerRegistry = argv["conatainer-registry"] || config.containerRegistry
config.createPullSecret = argv["create-pull-secret"] || config.createPullSecret

argv["db"] ? config.db = argv["db"] as any : config.db || 'none'
config.directory = argv.directory || config.directory

if (config.containerRegistry === '') {
  console.log('Error: No container registry specyfied.')
  process.exit()
}

const pkgDirectory = config.directory;
const pkgName = argv._[0] as string;

// Add nestjs package
createNestApp(`${pkgDirectory}/${pkgName}`);

// Add docker
createDockerFiles(`${pkgDirectory}/${pkgName}`);

// Add spacedev configuration
createDevSpace(pkgName, pkgDirectory, config);

// add k8s infrastructure
createK8s(pkgName, pkgDirectory, config);

console.log(`📦 ${pkgName} created!`);
