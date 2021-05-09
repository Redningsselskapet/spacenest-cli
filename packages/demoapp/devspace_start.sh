#!/bin/bash

COLOR_CYAN="\033[0;36m"
COLOR_RESET="\033[0m"
PKG_NAME=$(node -pe "require('./package.json').name")
PKG_VERSION=$(node -pe "require('./package.json').version")

echo -e "${COLOR_CYAN}
╭━━━┳━━━╮╱╱╭━╮╭━╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭━━━╮
┃╭━╮┃╭━╮┃╱╱┃┃╰╯┃┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃╭━╮┃
┃╰━╯┃╰━━╮╱╱┃╭╮╭╮┣━━┳━┳┳━╮╭━━╮╱╱┃╰━━┳━━┳━┳╮╭┳┳━━┳━━┳━━╮
┃╭╮╭┻━━╮┣━━┫┃┃┃┃┃╭╮┃╭╋┫╭╮┫┃━╋━━╋━━╮┃┃━┫╭┫╰╯┣┫╭━┫┃━┫━━┫
┃┃┃╰┫╰━╯┣━━┫┃┃┃┃┃╭╮┃┃┃┃┃┃┃┃━╋━━┫╰━╯┃┃━┫┃╰╮╭┫┃╰━┫┃━╋━━┃
╰╯╰━┻━━━╯╱╱╰╯╰╯╰┻╯╰┻╯╰┻╯╰┻━━╯╱╱╰━━━┻━━┻╯╱╰╯╰┻━━┻━━┻━━╯
${COLOR_RESET}

${PKG_NAME}-${PKG_VERSION} 📦

Velkommen til din utviklingskontainer!

Dette er måten du kan bruke den:
- ${COLOR_CYAN}Filer blir synkronisert${COLOR_RESET} mellom din lokale maskin og denne kontaineren
- Enkelte filer er eller kan eksluderes fra synkronisering (see devspace.yaml)

npm run install
npm run start:dev

Kos deg i utviklingsrommet! 🪐
"

bash

