import fs from 'fs';
import path from 'path';
import { EmailTemplate, EmailOptions, EmailServiceConfig, EmailTemplateType, PasswordResetEmailData, EmailVerificationData } from '../../types/email.types';

class EmailService {
  private static config: EmailServiceConfig = {
    appName: process.env.APP_NAME || 'Node Auth',
    fromEmail: process.env.FROM_EMAIL || 'noreply@nodeauth.com',
    fromName: process.env.FROM_NAME || 'Node Auth Team'
  };

  /**
   * Load and render email template with provided data
   * 
   * @param templateType - Type of email template to load
   * @param data - Data to inject into the template
   * @returns Rendered email template with HTML and text versions
   */
  private static async loadTemplate(templateType: EmailTemplateType, data: any): Promise<EmailTemplate> {
    const templatesDir = path.join(__dirname, '../../templates/emails');
    
    try {
      // Load HTML template
      const htmlPath = path.join(templatesDir, `${templateType}.html`);
      const htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');
      
      // Load text template
      const textPath = path.join(templatesDir, `${templateType}.txt`);
      const textTemplate = fs.readFileSync(textPath, 'utf-8');
      
      // Render templates with data
      const html = this.renderTemplate(htmlTemplate, data);
      const text = this.renderTemplate(textTemplate, data);
      
      // Generate subject based on template type
      const subject = this.getSubjectForTemplate(templateType);
      
      return { subject, html, text };
    } catch (error) {
      throw new Error(`Failed to load email template '${templateType}': ${error}`);
    }
  }

  /**
   * Simple template rendering function (replaces {{variable}} with data values)
   * 
   * @param template - Template string with placeholders
   * @param data - Data object to inject into template
   * @returns Rendered template string
   */
  private static renderTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Get email subject based on template type
   * 
   * @param templateType - Type of email template
   * @returns Email subject string
   */
  private static getSubjectForTemplate(templateType: EmailTemplateType): string {
    const subjects: Record<EmailTemplateType, string> = {
      'password-reset': 'Password Reset Verification Code',
      'email-verification': 'Email Verification Code'
    };
    
    return subjects[templateType] || 'Notification';
  }

  /**
   * Send password reset email with verification code
   * 
   * @param email - Recipient email address
   * @param verificationCode - 6-digit verification code
   * @param expirationMinutes - Code expiration time in minutes (default: 60)
   * @returns Promise<void>
   */
  public static async sendPasswordResetEmail(
    email: string, 
    verificationCode: string, 
    expirationMinutes: number = 60
  ): Promise<void> {
    const templateData: PasswordResetEmailData = {
      verificationCode,
      expirationTime: `${expirationMinutes} minute${expirationMinutes !== 1 ? 's' : ''}`,
      appName: this.config.appName,
      currentYear: new Date().getFullYear()
    };

    const template = await this.loadTemplate('password-reset', templateData);
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    // Send email using configured email provider
    await this.sendEmail(emailOptions);
  }

  /**
   * Send email verification email with verification code
   * 
   * @param email - Recipient email address
   * @param verificationCode - 6-digit verification code
   * @param expirationMinutes - Code expiration time in minutes (default: 15)
   * @returns Promise<void>
   */
  public static async sendVerificationEmail(
    email: string, 
    verificationCode: string, 
    expirationMinutes: number = 15
  ): Promise<void> {
    const templateData: EmailVerificationData = {
      verificationCode,
      expirationTime: `${expirationMinutes} minute${expirationMinutes !== 1 ? 's' : ''}`,
      appName: this.config.appName,
      currentYear: new Date().getFullYear()
    };

    const template = await this.loadTemplate('email-verification', templateData);
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    // Send email using configured email provider
    await this.sendEmail(emailOptions);
  }

  /**
   * Send email using configured email service
   * This is where you would integrate with SendGrid, Nodemailer, AWS SES, etc.
   * 
   * @param options - Email options including recipient, subject, and content
   * @returns Promise<void>
   */
  private static async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Implement actual email sending
    // This is where you would integrate with your email service provider
    
    // Example implementations:
    // 
    // For SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   from: { email: this.config.fromEmail, name: this.config.fromName },
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text
    // });
    //
    // For Nodemailer:
    // const transporter = nodemailer.createTransporter({ ... });
    // await transporter.sendMail({
    //   from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text
    // });

    // For development/testing, log the email details
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL WOULD BE SENT ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Text Content:\n${options.text}`);
      console.log('===========================\n');
    }
  }

  /**
   * Update email service configuration
   * 
   * @param config - New configuration options
   */
  public static updateConfig(config: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current email service configuration
   * 
   * @returns Current email service configuration
   */
  public static getConfig(): EmailServiceConfig {
    return { ...this.config };
  }
}

export default EmailService;