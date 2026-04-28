import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_oc2me1s';
const TEMPLATE_ID = 'template_up60vb6';
const PUBLIC_KEY  = 'iAwGgZTwuegADSBGg';

@Injectable({ providedIn: 'root' })
export class EmailService {
  send(to_email: string, to_name: string, subject: string, message: string): void {
    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, { to_email, to_name, subject, message }, PUBLIC_KEY)
      .catch((err) => console.error('EmailJS failed:', err));
  }
}