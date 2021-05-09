import { writeFileSync } from "fs";

export const createDockerFiles = function(path: string) {
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
writeFileSync(`${path}/Dockerfile`, dockerfile);
writeFileSync(`${path}/.dockerignore`, dockerignore);

}