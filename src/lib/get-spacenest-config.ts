import { readFileSync } from "fs";
import findUp from "find-up";

export interface SpaceNestConfig {
  containerRegistry: string;
  createPullSecret: boolean;
  directory: string;
  db: "none" | "mysql" | "postgresql" | "mongodb";
}

export const getSpaceNestConfig = function (): SpaceNestConfig {
  const configPath = findUp.sync("spacenest.config.json");
  if (configPath) {
    console.log("Using configuration from " + configPath);
    const jsonString = readFileSync(configPath, "utf-8");
    try {
      const config = JSON.parse(jsonString);
      return config;
    } catch (err) {
      console.error(`Error: ${configPath} is not valid`);
      process.exit(1)
    }
  }
  console.log("No valid spaceconfig found in path. Using defaults");
  const defaultConfig: SpaceNestConfig =  {
    containerRegistry: "local",
    createPullSecret: false,
    directory: "packages",
    db: "none",
  };
  return defaultConfig;
};
