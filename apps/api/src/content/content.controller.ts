import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { EditorGuard } from '../auth/editor.guard';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  findAll(@Query('section') section?: string) {
    return this.content.findAll(section);
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.content.findByKey(key);
  }

  @Put('bulk')
  @UseGuards(EditorGuard)
  bulkUpdate(
    @Body()
    body: { blocks: { key: string; value: string; type?: ContentType; section?: string }[] },
  ) {
    return this.content.bulkUpdate(body.blocks);
  }

  @Put(':key')
  @UseGuards(EditorGuard)
  update(
    @Param('key') key: string,
    @Body() body: { value: string; type?: ContentType; section?: string },
  ) {
    return this.content.update(key, body.value, body.type, body.section);
  }

  @Get(':key/versions')
  @UseGuards(EditorGuard)
  getVersions(@Param('key') key: string) {
    return this.content.getVersions(key);
  }

  @Post(':key/rollback')
  @UseGuards(EditorGuard)
  rollback(@Param('key') key: string, @Body() body: { versionId: string }) {
    return this.content.rollback(key, body.versionId);
  }

  @Post()
  @UseGuards(EditorGuard)
  create(
    @Body()
    body: { key: string; value: string; type: ContentType; section: string },
  ) {
    return this.content.create(body.key, body.value, body.type, body.section);
  }

  @Delete(':key')
  @UseGuards(EditorGuard)
  delete(@Param('key') key: string) {
    return this.content.delete(key);
  }
}
