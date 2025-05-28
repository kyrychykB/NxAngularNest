import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { UserDto } from '@shared/data';

@Component({
  selector: 'nx-angular-nest-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
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
