import { Injectable } from '@nestjs/common';
import type { OrganizationValidationPort } from '../../domain/ports/organization.ports';

@Injectable()
export class OrganizationValidationAdapter implements OrganizationValidationPort {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateWebsite(website: string): boolean {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  validatePhone(phone: string): boolean {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){6,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
