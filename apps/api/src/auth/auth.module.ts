import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { ClerkGuard } from './clerk.guard';
import { EditorGuard } from './editor.guard';
import { WorkforceGuard } from './workforce.guard';

@Global()
@Module({
  providers: [AdminGuard, ClerkGuard, EditorGuard, WorkforceGuard],
  exports: [AdminGuard, ClerkGuard, EditorGuard, WorkforceGuard],
})
export class AuthModule {}
