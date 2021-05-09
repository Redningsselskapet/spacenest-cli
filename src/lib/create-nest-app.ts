import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

export const createNestApp = function (path: string) {
  const cmd = `npx @nestjs/cli new -gs ${path}`;
  execSync(cmd);

  // Add controlller
  const appController = `
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  
  @Get('/')
  showConfig() {
    return {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
    };
  }
}
`;
  writeFileSync(`${path}/src/app.controller.ts`, appController);

  // add devspace to scripts section of package.json

const packageJson = JSON.parse(
  readFileSync(`${path}/package.json`, "utf-8")
);
const packageJsonPartly = {
  scripts: {
    "devspace:build": "devspace build",
    "devspace:deploy": "devspace deploy",
  },
};
const scripts = {
  ...packageJson.scripts,
  ...{
    "devspace:build": "devspace build",
    "devspace:deploy": "devspace deploy",
    "devspace:purge": "devspace purge"
  },
};
packageJson.scripts = scripts;
writeFileSync(
  `${path}/package.json`,
  JSON.stringify(packageJson, null, 2),
  { encoding: "utf-8" }
);
};
