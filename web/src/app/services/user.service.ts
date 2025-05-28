// apps/web/src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserDto } from '@shared/data';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  async getCurrentUser(): Promise<UserDto> {
    const raw = await firstValueFrom(this.http.get('/api/user'));
    const user = plainToInstance(UserDto, raw);
    await validateOrReject(user);
    return user;
  }
}
