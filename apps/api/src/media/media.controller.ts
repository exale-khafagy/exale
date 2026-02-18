import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { EditorGuard } from '../auth/editor.guard';
import { ClerkGuard } from '../auth/clerk.guard';
import { CreateMediaFileDto, MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  @UseGuards(ClerkGuard)
  async create(
    @Body() dto: CreateMediaFileDto,
    @Req() req: Request & { clerkId: string },
  ) {
    return this.media.create({
      ...dto,
      uploadedBy: req.clerkId,
    });
  }

  @Get()
  @UseGuards(EditorGuard)
  findAll() {
    return this.media.findAll();
  }

  @Get(':id')
  @UseGuards(EditorGuard)
  findOne(@Param('id') id: string) {
    return this.media.findOne(id);
  }

  @Delete(':id')
  @UseGuards(EditorGuard)
  delete(@Param('id') id: string) {
    return this.media.delete(id);
  }
}
