# SpaceNest-CLI

Scaffold a nestjs application with docker build setup, k8s infrastructure and devspace config.

## Configuration

Add spacenest.config.json at root of your monorepo:

```json
{
  "containerRegistry": "banker.azurecr.io",
  "imagePullSecret": "acr"
}
```

Create a package (creates package under packages directory. Use --directory to override)

```bash
create-package demo-app
```

