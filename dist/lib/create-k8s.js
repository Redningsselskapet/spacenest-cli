"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createK8s = void 0;
var fs_1 = require("fs");
var js_yaml_1 = require("js-yaml");
var createK8s = function (pkgName, pkgDirectory, config) {
    fs_1.mkdirSync(pkgDirectory + "/" + pkgName + "/k8s");
    var k8sYamlDeploymentStr = js_yaml_1.dump(JSON.parse(k8sYamlDeployment(pkgName, config)));
    fs_1.writeFileSync(pkgDirectory + "/" + pkgName + "/k8s/" + pkgName + ".deployment.yaml", k8sYamlDeploymentStr, "utf8");
    var k8sYamlServiceStr = js_yaml_1.dump(JSON.parse(k8sYamlService(pkgName.toString())));
    fs_1.writeFileSync(pkgDirectory + "/" + pkgName + "/k8s/" + pkgName + ".service.yaml", k8sYamlServiceStr, "utf8");
    var k8sYamlConfigStr = js_yaml_1.dump(JSON.parse(k8sYamlConfig(pkgName.toString())));
    fs_1.writeFileSync(pkgDirectory + "/" + pkgName + "/k8s/" + pkgName + ".config.dev.yaml", k8sYamlConfigStr, "utf8");
};
exports.createK8s = createK8s;
var k8sYamlDeployment = function (pkgName, config) {
    return "\n  {\n    \"apiVersion\": \"apps/v1\",\n    \"kind\": \"Deployment\",\n    \"metadata\": {\n      \"name\": \"" + pkgName + "\"\n    },\n    \"spec\": {\n      \"replicas\": 1,\n      \"selector\": {\n        \"matchLabels\": {\n          \"app\": \"" + pkgName + "\"\n        }\n      },\n      \"template\": {\n        \"metadata\": {\n          \"labels\": {\n            \"app\": \"" + pkgName + "\"\n          }\n        },\n        \"spec\": {\n          \"containers\": [\n            {\n              \"name\": \"" + pkgName + "\",\n              \"image\": \"" + config.containerRegistry + "/app-" + pkgName + "\",\n              \"resources\": {\n                \"requests\": {\n                  \"memory\": \"256Mi\",\n                  \"cpu\": \"100m\"\n                },\n                \"limits\": {\n                  \"memory\": \"1024Mi\",\n                  \"cpu\": \"250m\"\n                }\n              },\n              \"envFrom\": [\n                {\n                  \"configMapRef\": {\n                    \"name\": \"" + pkgName + "-config\"\n                  }\n                }\n              ],\n              \"imagePullPolicy\": \"Always\"\n            }\n          ],\n          \"imagePullSecrets\": [\n            {\n              \"name\": \"acr\"\n            }\n          ]\n        }\n      }\n    }\n  }\n  ";
};
var k8sYamlService = function (pkgName) {
    return "\n  {\n    \"apiVersion\": \"v1\",\n    \"kind\": \"Service\",\n    \"metadata\": {\n      \"name\": \"" + pkgName + "-srv\"\n    },\n    \"spec\": {\n      \"selector\": {\n        \"app\": \"" + pkgName + "\"\n      },\n      \"ports\": [\n        {\n          \"name\": \"" + pkgName + "\",\n          \"protocol\": \"TCP\",\n          \"port\": 3000,\n          \"targetPort\": 3000\n        }\n      ]\n    }\n  }\n  ";
};
var k8sYamlConfig = function (pkgName) {
    return "\n  {\n    \"kind\": \"ConfigMap\",\n    \"apiVersion\": \"v1\",\n    \"metadata\": {\n      \"name\": \"" + pkgName + "-config\"\n    },\n    \"data\": {}\n  }\n  ";
};
