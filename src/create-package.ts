import appRootPath from "app-root-path";
import {
  existsSync
} from "fs";
import { command } from "yargs";
import { createDevSpace } from "./lib/create-devspace";
import { createDockerFiles } from "./lib/create-docker-files";
import { createK8s } from "./lib/create-k8s";
import { createNestApp } from "./lib/create-nest-app";
import { readSpaceNestConfig } from "./lib/read-config";

const rootPath = appRootPath.path;
const spaceNestConfigPath = `${rootPath}/spacenest.config.json`;

// Read config from spacenest.config.json
const config = readSpaceNestConfig(spaceNestConfigPath);

// Read and check input parameters
const argv = command("name", "package name", {
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
  .check((argv) => {
    if (argv._.length !== 1) throw new Error("Argumnet check failed");
    if (existsSync(`${argv.directory}/${argv._[0].toString()}`))
      throw new Error("Argumnet check failed: A package with that name exists");
    return true;
  }).argv;

const pkgDirectory = argv.directory as string || 'packages'
const pkgName = argv._[0] as string;

// Add nestjs package
createNestApp(`${pkgDirectory}/${pkgName}`);

// Add docker
createDockerFiles(`${pkgDirectory}/${pkgName}`);

// Add spacedev configuration
createDevSpace(pkgName, pkgDirectory, config);

// add k8s infrastructure
createK8s(pkgName, pkgDirectory, config);

console.log(`${pkgName} created! 📦`);
