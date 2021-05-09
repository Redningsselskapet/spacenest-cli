# SpaceNest-CLI

Scaffold a nestjs application with docker build setup, k8s infrastructure and devspace config.

## Configuration

Add spacenest.config.json at root.

```json
{
  "containerRegistry": "banker.azurecr.io",
  "imagePullSecret": "acr"
}
```
This will tell devspace tp use image pull secret in kubernets named acr. Changed for whatever you named it.


Create a package creates a package under packages directory. Use **--directory \<dirname**\> option to set directory.

```bash
create-package --directory ./packages demo-app
```

