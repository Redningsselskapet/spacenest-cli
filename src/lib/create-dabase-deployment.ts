import { SpaceNestConfig } from "./get-spacenest-config";

export const getDatabaseDeployment = function (
  pkgName: string,
  db: SpaceNestConfig["db"]
) {
  switch (db) {
    case "mysql": {
      return getMysqlDeployment(pkgName);
      break;
    }
    case "postgresql": {
      return getPostgreSql(pkgName);
      break;
    }
    case "mongodb": {
      return getMongoDb(pkgName);
      break;
    }

    case "none": {
      return '';
      break;
    }
    default: {
      return "";
      break;
    }
  }
};

const getMysqlDeployment = (pkgName: string) => `{
  "name": "${pkgName}-database",
  "helm": {
    "chart": {
      "name": "bitnami/mysql"
    },
    "values": {}
  }
}`;

const getPostgreSql = (pkgName: string) => `{
  "name": "${pkgName}-database",
  "helm": {
    "chart": {
      "name": "bitnami/postgresql"
    },
    "values": {}
  }
}`;

const getMongoDb = (pkgName: string) => `{
  "name": "${pkgName}-database",
  "helm": {
    "chart": {
      "name": "bitnami/mongodb"
    },
    "values": {}
  }
}`;
