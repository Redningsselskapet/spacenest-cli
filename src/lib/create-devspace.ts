import { chmodSync, writeFileSync } from "fs";
import { dump } from "js-yaml";
import { getDatabaseDeployment } from "./create-dabase-deployment";
import { SpaceNestConfig } from "./get-spacenest-config";

export const createDevSpace = function (
  pkgName: string,
  pkgDirectory: string,
  config: SpaceNestConfig
) {
  const jsonStr = devspaceJson(pkgName, config)
  const parsed = JSON.parse(jsonStr)
  const devspaceYaml = dump(parsed);
  writeFileSync(
    `${pkgDirectory}/${pkgName}/devspace.yaml`,
    devspaceYaml,
    "utf8"
  );

  createDevSpaceStartup(pkgName, pkgDirectory);
};

const devspaceJson = function (pkgName: string, config: SpaceNestConfig): any {
  const db = getDatabaseDeployment(pkgName, config.db);
  
  return `
  {
    "version": "v1beta10",
    "images": {
      "app-${pkgName}": {
        "image": "${config.containerRegistry}/app-${pkgName}",
        "createPullSecret": ${config.createPullSecret},
        "dockerfile": "./Dockerfile",
        "build": {
          "kaniko": {
            "cache": true
          },
          "disabled": false
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
      } ${db ? ',' + db : ''}
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

const createDevSpaceStartup = function (pkgName: string, pkgDirectory: string) {
  const colorReset = "${COLOR_RESET}";
  const color = "${COLOR_CYAN}";
  const pkg = "${PKG_NAME}";
  const version = "${PKG_VERSION}";

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

${pkg}-${version} 📦

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
    `${pkgDirectory}/${pkgName}/devspace_start.sh`,
    devspaceStart,
    "utf8"
  );
  chmodSync(`${pkgDirectory}/${pkgName}/devspace_start.sh`, "755");
};
