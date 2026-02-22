import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubmissionStatus } from '@prisma/client';
import { EditorGuard } from '../auth/editor.guard';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @Throttle({ form: { limit: 5, ttl: 60000 } })
  create(@Body() body: { name?: string; email?: string; phone?: string; concern?: string; message?: string; honeypot?: string }) {
    if (body.honeypot) return { id: 'ok' }; // Bot trap – reject silently
    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const concern = body.concern?.trim();
    const message = body.message?.trim();
    if (!name || !email || !phone || !concern || !message) {
      throw new BadRequestException('All fields are required: name, email, phone, concern, message.');
    }
    return this.contact.create({ name, email, phone, concern, message });
  }

  @Get()
  @UseGuards(EditorGuard)
  findAll() {
    return this.contact.findAll();
  }

  @Get(':id')
  @UseGuards(EditorGuard)
  findOne(@Param('id') id: string) {
    return this.contact.findOne(id);
  }

  @Patch(':id')
  @UseGuards(EditorGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: SubmissionStatus }) {
    return this.contact.updateStatus(id, body.status);
  }
}
