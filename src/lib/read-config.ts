import { readFileSync } from "fs"

export interface SpaceNestConfig {
  containerRegistry: string
}

export const readSpaceNestConfig = function (path: string): SpaceNestConfig {
  return JSON.parse(readFileSync(path, "utf-8"))
}
