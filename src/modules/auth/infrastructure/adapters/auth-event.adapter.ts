import { Injectable } from '@nestjs/common';
import { AuthEventPort } from '../../domain/ports/auth.ports';

@Injectable()
export class AuthEventAdapter implements AuthEventPort {
  async publishLoginEvent(userId: string, timestamp: Date): Promise<void> {
    // For now, just log the event. In a real app, you might publish to a message queue
    console.log(`User ${userId} logged in at ${timestamp.toISOString()}`);
  }

  async publishLogoutEvent(userId: string, timestamp: Date): Promise<void> {
    // For now, just log the event. In a real app, you might publish to a message queue
    console.log(`User ${userId} logged out at ${timestamp.toISOString()}`);
  }

  async publishPasswordChangeEvent(userId: string, timestamp: Date): Promise<void> {
    // For now, just log the event. In a real app, you might publish to a message queue
    console.log(`User ${userId} changed password at ${timestamp.toISOString()}`);
  }
}
