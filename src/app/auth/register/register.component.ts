// src/app/pages/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { RegisterPayload } from '../auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [  RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // <-- styleUrls
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    firstName:['',Validators.required],
    lastName:['',Validators.required],
    username: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterPayload = {
      firstname: this.form.value.firstName!,
      lastname:this.form.value.lastName!,
      username: this.form.value.username!,
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.loading.set(true);

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        // εδώ έχεις 2 επιλογές:
        // 1) να πας στο login (όπως ήδη έκανες)
        this.router.navigateByUrl('/login');

        // 2) ή να πας κατευθείαν σε εταιρείες, αν έκανες auto-login
        // this.router.navigateByUrl('/companies');
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          'Αποτυχία εγγραφής. Έλεγξε τα στοιχεία.';
        this.errorMsg.set(msg);
      },
    });
  }
}
