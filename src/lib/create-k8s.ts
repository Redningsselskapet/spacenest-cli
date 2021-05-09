import { mkdirSync, writeFileSync } from "fs";
import { dump } from "js-yaml";
import { SpaceNestConfig } from "./read-config";

export const createK8s = function(pkgName: string, pkgDirectory: string, config: SpaceNestConfig) {

  mkdirSync(`${pkgDirectory}/${pkgName}/k8s`);

const k8sYamlDeploymentStr = dump(
  JSON.parse(k8sYamlDeployment(pkgName, config))
);
writeFileSync(
  `${pkgDirectory}/${pkgName}/k8s/${pkgName}.deployment.yaml`,
  k8sYamlDeploymentStr,
  "utf8"
);
const k8sYamlServiceStr = dump(
  JSON.parse(k8sYamlService(pkgName.toString()))
);

writeFileSync(
  `${pkgDirectory}/${pkgName}/k8s/${pkgName}.service.yaml`,
  k8sYamlServiceStr,
  "utf8"
);

const k8sYamlConfigStr = dump(JSON.parse(k8sYamlConfig(pkgName.toString())));

writeFileSync(
  `${pkgDirectory}/${pkgName}/k8s/${pkgName}.config.dev.yaml`,
  k8sYamlConfigStr,
  "utf8"
);

}

const k8sYamlDeployment = function (pkgName: string, config: SpaceNestConfig): string {
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