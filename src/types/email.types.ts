export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface PasswordResetEmailData {
  verificationCode: string;
  expirationTime: string;
  appName: string;
  currentYear: number;
}

export interface EmailVerificationData {
  verificationCode: string;
  expirationTime: string;
  appName: string;
  currentYear: number;
}

export interface EmailServiceConfig {
  appName: string;
  fromEmail: string;
  fromName: string;
}

export type EmailTemplateType = 'password-reset' | 'email-verification';