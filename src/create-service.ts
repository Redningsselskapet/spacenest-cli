import { execSync } from "child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { command } from "yargs";
import { path as rootPath } from "app-root-path";
import { dump } from "js-yaml";

// Read config from spacenest.config.json
const config: { containerRegistry: string } = JSON.parse(
  readFileSync(rootPath + "/spacenest.config.json", "utf-8")
);

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

// Add package
const cmd = `npx @nestjs/cli new -gs ${argv.directory}/${argv._[0]}`;
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

writeFileSync(
  `${argv.directory}/${argv._[0]}/src/app.controller.ts`,
  appController
);

// add devspace to scripts section of package.json

const packageJson = JSON.parse(
  readFileSync(`${argv.directory}/${argv._[0]}/package.json`, "utf-8")
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
  `${argv.directory}/${argv._[0]}/package.json`,
  JSON.stringify(packageJson, null, 2),
  { encoding: "utf-8" }
);

// Add Dockerfile, .ignoredockerfile
const dockerfile = `
FROM node:14-alpine
WORKDIR /dist
COPY package.json .
RUN npm install 
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
`;

const dockerignore = `
node_modules
dist
`;
writeFileSync(`${argv.directory}/${argv._[0]}/Dockerfile`, dockerfile);
writeFileSync(`${argv.directory}/${argv._[0]}/.dockerignore`, dockerignore);

// Add spacedev configuration
const devspaceJson = function (pkgName: string): any {
  return `
  {
    "version": "v1beta10",
    "images": {
      "app-${pkgName}": {
        "image": "${config.containerRegistry}/app-${pkgName}",
        "dockerfile": "./Dockerfile",
        "build": {
          "kaniko": {
            "cache": true
          },
          "disabled": true
        }
      }
    },
    "deployments": [
      {
        "name": "app-${pkgName}",
        "kubectl": {
          "manifests": [
            "k8s/**"
          ]
        }
      }
    ],
    "dev": {
      "ports": [
        {
          "imageName": "app-${pkgName}",
          "forward": [
            {
              "port": 3000
            }
          ]
        }
      ],
      "open": [
        {
          "url": "http://localhost:3000"
        }
      ],
      "sync": [
        {
          "imageName": "app-${pkgName}",
          "disableDownload": false,
          "excludePaths": [
            ".git/"
          ],
          "uploadExcludePaths": [
            "node_modules",
            "dist",
            "k8s"
          ]
        }
      ],
      "terminal": {
        "imageName": "app-${pkgName}",
        "command": [
          "./devspace_start.sh"
        ]
      },
      "replacePods": [
        {
          "imageName": "app-${pkgName}",
          "replaceImage": "loftsh/alpine:latest",
          "patches": [
            {
              "op": "replace",
              "path": "spec.containers[0].command",
              "value": [
                "sleep"
              ]
            },
            {
              "op": "replace",
              "path": "spec.containers[0].args",
              "value": [
                "9999999"
              ]
            },
            {
              "op": "remove",
              "path": "spec.containers[0].securityContext"
            }
          ]
        }
      ]
    },
    "profiles": [
      {
        "name": "production",
        "patches": [
          {
            "op": "remove",
            "path": "images.app-${pkgName}.build.disabled"
          }
        ]
      }
    ]
  }
  `;
};

const devspaceYaml = dump(JSON.parse(devspaceJson(argv._[0].toString())));
writeFileSync(
  `${argv.directory}/${argv._[0]}/devspace.yaml`,
  devspaceYaml,
  "utf8"
);

const colorReset = "${COLOR_RESET}";
const color = "${COLOR_CYAN}";
const pkgName = "${PKG_NAME}";
const pkgVersion = "${PKG_VERSION}";

const devspaceStart = `#!/bin/bash

COLOR_CYAN="\\033[0;36m"
COLOR_RESET="\\033[0m"
PKG_NAME=$(node -pe "require('./package.json').name")
PKG_VERSION=$(node -pe "require('./package.json').version")

echo -e "${color}
╭━━━┳━━━╮╱╱╭━╮╭━╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭━━━╮
┃╭━╮┃╭━╮┃╱╱┃┃╰╯┃┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃╭━╮┃
┃╰━╯┃╰━━╮╱╱┃╭╮╭╮┣━━┳━┳┳━╮╭━━╮╱╱┃╰━━┳━━┳━┳╮╭┳┳━━┳━━┳━━╮
┃╭╮╭┻━━╮┣━━┫┃┃┃┃┃╭╮┃╭╋┫╭╮┫┃━╋━━╋━━╮┃┃━┫╭┫╰╯┣┫╭━┫┃━┫━━┫
┃┃┃╰┫╰━╯┣━━┫┃┃┃┃┃╭╮┃┃┃┃┃┃┃┃━╋━━┫╰━╯┃┃━┫┃╰╮╭┫┃╰━┫┃━╋━━┃
╰╯╰━┻━━━╯╱╱╰╯╰╯╰┻╯╰┻╯╰┻╯╰┻━━╯╱╱╰━━━┻━━┻╯╱╰╯╰┻━━┻━━┻━━╯
${colorReset}

${pkgName}-${pkgVersion} 📦

Velkommen til din utviklingskontainer!

Dette er måten du kan bruke den:
- ${color}Filer blir synkronisert${colorReset} mellom din lokale maskin og denne kontaineren
- Enkelte filer er eller kan eksluderes fra synkronisering (see devspace.yaml)

npm run install
npm run start:dev

Kos deg i utviklingsrommet! 🪐
"

bash

`;
writeFileSync(
  `${argv.directory}/${argv._[0]}/devspace_start.sh`,
  devspaceStart,
  "utf8"
);
chmodSync(`${argv.directory}/${argv._[0]}/devspace_start.sh`, "755");

// add k8s infrastructure
const k8sYamlDeployment = function (pkgName: string): string {
  return `
  {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": "${pkgName}"
    },
    "spec": {
      "replicas": 1,
      "selector": {
        "matchLabels": {
          "app": "${pkgName}"
        }
      },
      "template": {
        "metadata": {
          "labels": {
            "app": "${pkgName}"
          }
        },
        "spec": {
          "containers": [
            {
              "name": "${pkgName}",
              "image": "${config.containerRegistry}/app-${pkgName}",
              "resources": {
                "requests": {
                  "memory": "256Mi",
                  "cpu": "100m"
                },
                "limits": {
                  "memory": "1024Mi",
                  "cpu": "250m"
                }
              },
              "envFrom": [
                {
                  "configMapRef": {
                    "name": "${pkgName}-config"
                  }
                }
              ],
              "imagePullPolicy": "Always"
            }
          ],
          "imagePullSecrets": [
            {
              "name": "acr"
            }
          ]
        }
      }
    }
  }
  `;
};

const k8sYamlService = function (pkgName: string): string {
  return `
  {
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
      "name": "${pkgName}-srv"
    },
    "spec": {
      "selector": {
        "app": "${pkgName}"
      },
      "ports": [
        {
          "name": "${pkgName}",
          "protocol": "TCP",
          "port": 3000,
          "targetPort": 3000
        }
      ]
    }
  }
  `;
};

const k8sYamlConfig = function (pkgName: string): string {
  return `
  {
    "kind": "ConfigMap",
    "apiVersion": "v1",
    "metadata": {
      "name": "${pkgName}-config"
    },
    "data": {}
  }
  `;
};

mkdirSync(`${argv.directory}/${argv._[0]}/k8s`);

const k8sYamlDeploymentStr = dump(
  JSON.parse(k8sYamlDeployment(argv._[0].toString()))
);
writeFileSync(
  `${argv.directory}/${argv._[0]}/k8s/${argv._[0]}.deployment.yaml`,
  k8sYamlDeploymentStr,
  "utf8"
);
const k8sYamlServiceStr = dump(
  JSON.parse(k8sYamlService(argv._[0].toString()))
);

writeFileSync(
  `${argv.directory}/${argv._[0]}/k8s/${argv._[0]}.service.yaml`,
  k8sYamlServiceStr,
  "utf8"
);

const k8sYamlConfigStr = dump(JSON.parse(k8sYamlConfig(argv._[0].toString())));

writeFileSync(
  `${argv.directory}/${argv._[0]}/k8s/${argv._[0]}.config.dev.yaml`,
  k8sYamlConfigStr,
  "utf8"
);

console.log(`${argv._[0]} created! 📦`);
