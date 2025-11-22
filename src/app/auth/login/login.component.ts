import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

submit() {
  this.errorMsg.set(null);

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  // Πάρε τα δεδομένα από τη φόρμα
  const payload = this.form.value as { username: string; password: string };

  this.loading.set(true);
  this.auth.login(payload).subscribe({
    next: () => {
      this.loading.set(false);
      this.router.navigateByUrl('/companies');
    },
    error: err => {
      this.loading.set(false);
      this.errorMsg.set(err?.error?.message || 'Αποτυχία σύνδεσης');
    }
  });
}

  get f() { return this.form.controls; }
}
