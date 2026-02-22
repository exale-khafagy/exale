import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubmissionStatus } from '@prisma/client';
import { EditorGuard } from '../auth/editor.guard';
import { ApplyService } from './apply.service';

@Controller('apply')
export class ApplyController {
  constructor(private readonly apply: ApplyService) {}

  @Post()
  @Throttle({ form: { limit: 5, ttl: 60000 } })
  create(
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      industry?: string;
      message?: string;
      fileUrl?: string;
      honeypot?: string;
    },
  ) {
    if (body.honeypot) return { id: 'ok' }; // Bot trap – reject silently
    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const industry = body.industry?.trim();
    const message = body.message?.trim();
    if (!name || !email || !phone || !industry || !message) {
      throw new BadRequestException('All fields are required except attachment: name, email, phone, industry, message.');
    }
    return this.apply.create({ name, email, phone, industry, message, fileUrl: body.fileUrl });
  }

  @Get()
  @UseGuards(EditorGuard)
  findAll() {
    return this.apply.findAll();
  }

  @Get(':id')
  @UseGuards(EditorGuard)
  findOne(@Param('id') id: string) {
    return this.apply.findOne(id);
  }

  @Patch(':id')
  @UseGuards(EditorGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: SubmissionStatus }) {
    return this.apply.updateStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(EditorGuard)
  remove(@Param('id') id: string) {
    return this.apply.remove(id);
  }
}
