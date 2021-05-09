
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  
  @Get('/')
  showConfig() {
    return {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
    };
  }
}
