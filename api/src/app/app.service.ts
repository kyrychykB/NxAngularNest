import { Injectable } from '@nestjs/common';
import {UserDto} from "@shared/data";

@Injectable()
export class AppService {
  getData(): UserDto {
    return {
      username: 'Test User',
      email: 'test@test.com',
    };
  }
}
