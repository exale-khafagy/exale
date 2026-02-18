import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { ApplyModule } from './apply/apply.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { MediaModule } from './media/media.module';
import { ProfileModule } from './profile/profile.module';
import { SettingsModule } from './settings/settings.module';

const isDev = process.env.NODE_ENV !== 'production';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      // Higher limit in dev so dashboard tabs (Inbox, Apply, Media, Content, etc.) don't hit 429
      { name: 'default', ttl: 60000, limit: isDev ? 300 : 60 },
      { name: 'form', ttl: 60000, limit: 5 },
    ]),
    PrismaModule,
    AuthModule,
    ContentModule,
    ContactModule,
    ApplyModule,
    ProfileModule,
    HealthModule,
    NotificationsModule,
    AdminModule,
    SettingsModule,
    MediaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
