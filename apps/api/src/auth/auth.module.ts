import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { ClerkGuard } from './clerk.guard';
import { EditorGuard } from './editor.guard';

@Global()
@Module({
  providers: [AdminGuard, ClerkGuard, EditorGuard],
  exports: [AdminGuard, ClerkGuard, EditorGuard],
})
export class AuthModule {}
