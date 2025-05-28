# NxAngularNest – Full Stack Monorepo (Angular + NestJS + Shared DTOs)

This guide sets up a complete full-stack monorepo using Nx:

* ✅ Angular 18 frontend with standalone components
* ✅ NestJS backend on port `3000`
* ✅ Shared DTOs with `class-validator` / `class-transformer`
* ✅ Proxy setup from Angular to API for local development
* ✅ End-to-end strict typing and validation

---

## 📦 Prerequisites

* Node.js ≥ 18.x
* npm / pnpm / yarn
* IDE: VSCode or WebStorm

---

## 🚀 1. Create the Nx Workspace

```bash
npx create-nx-workspace@latest NxAngularNest \
  --preset=apps \
  --workspaceType=integrated \
  --nxCloud=skip
cd NxAngularNest
```

---

## ⚙️ 2. Generate Angular + NestJS Apps

```bash
npx nx add @nx/angular
npx nx g @nx/angular:app web \
  --style=scss \
  --routing \
  --standalone \
  --strict

npx nx add @nx/nest
npx nx g @nx/nest:app api --strict
```

---

## 🧱 3. Create Shared DTO/Model Library

```bash
npx nx add @nx/js
npx nx g @nx/js:lib shared-data \
  --importPath=@shared/data \
  --bundler=tsc \
  --unitTestRunner=jest
```

---

## 📦 4. Install Shared Packages

```bash
npm install class-validator class-transformer
```

---

## 📐 5. Add Path Aliases

In `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/data": ["libs/shared-data/src/index.ts"],
      "@shared/data/*": ["libs/shared-data/src/*"]
    }
  }
}
```

---

## ✏️ 6. Create a Shared DTO

```ts
// libs/shared-data/src/lib/user.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;
}
```

```ts
// libs/shared-data/src/index.ts
export * from './lib/user.dto';
```

---

## 🧩 7. Add API Endpoint

```ts
// apps/api/src/app/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from '@shared/data';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('user')
  getUser(): UserDto {
    return {
      username: 'bohdan',
      email: 'bohdan@example.com',
    };
  }
}
```

---

## 🌐 8. Implement Angular Service

```ts
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
```

---

## 🧠 9. Build Standalone Angular Component

```ts
// apps/web/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { UserDto } from '@shared/data';

@Component({
  selector: 'nx-angular-nest-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  user?: UserDto;
  error?: string;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    try {
      this.user = await this.userService.getCurrentUser();
    } catch (err) {
      this.error = 'Failed to load user';
      console.error(err);
    }
  }
}
```

```html
<!-- apps/web/src/app/app.component.html -->
<ng-container *ngIf="user as u">
  <h1>Hello, {{ u.username }}, {{ u.email }}</h1>
</ng-container>
<p *ngIf="error">{{ error }}</p>
<router-outlet></router-outlet>
```

---

## 🧰 10. Use `bootstrapApplication` with `provideHttpClient`

Update `apps/web/src/main.ts`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
});
```

No need to import `HttpClientModule` in components.

---

## 🌍 11. Add Proxy to Route `/api/*` to NestJS (port 3000)

```json
// apps/web/proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

In `apps/web/project.json`:

```jsonc
"serve": {
  "executor": "@nx/angular:dev-server",
  "options": {
    "proxyConfig": "apps/web/proxy.conf.json"
  }
}
```

---

## 🏁 12. Serve Your Apps

```bash
npx nx serve api       # http://localhost:3000
npx nx serve web       # http://localhost:4200
```

Expected output at `http://localhost:4200`:

```
Hello, bohdan, bohdan@example.com
```

---

## ✅ 13. Done!

* Shared DTOs and types
* Runtime validation with `class-validator`
* Angular standalone components
* Full local API + frontend connection

You’re ready to expand with auth, Swagger, Docker, or CI pipelines!
