import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(section?: string) {
    return this.prisma.contentBlock.findMany({
      where: section ? { section } : undefined,
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const block = await this.prisma.contentBlock.findUnique({
      where: { key },
    });
    if (!block) {
      throw new NotFoundException(`Content block "${key}" not found`);
    }
    return block;
  }

  async update(key: string, value: string, type?: ContentType, section?: string) {
    const existing = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (existing) {
      await this.prisma.contentBlockVersion.create({
        data: { blockKey: key, value: existing.value },
      });
    }
    return this.prisma.contentBlock.upsert({
      where: { key },
      create: { key, value, type: type ?? 'text', section: section ?? 'home' },
      update: { value, ...(type && { type }), ...(section && { section }) },
    });
  }

  async getVersions(blockKey: string) {
    return this.prisma.contentBlockVersion.findMany({
      where: { blockKey },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async rollback(blockKey: string, versionId: string) {
    const version = await this.prisma.contentBlockVersion.findFirst({
      where: { blockKey, id: versionId },
    });
    if (!version) throw new NotFoundException('Version not found');
    return this.update(blockKey, version.value);
  }

  async bulkUpdate(blocks: { key: string; value: string; type?: ContentType; section?: string }[]) {
    const results = await Promise.all(
      blocks.map((b) => this.update(b.key, b.value, b.type, b.section)),
    );
    return results;
  }

  async create(key: string, value: string, type: ContentType, section: string) {
    const existing = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (existing) {
      throw new Error(`Content block with key "${key}" already exists`);
    }
    return this.prisma.contentBlock.create({
      data: { key, value, type, section },
    });
  }

  async delete(key: string) {
    const block = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (!block) {
      throw new NotFoundException(`Content block "${key}" not found`);
    }
    // Delete versions first (if cascade doesn't work)
    await this.prisma.contentBlockVersion.deleteMany({ where: { blockKey: key } });
    return this.prisma.contentBlock.delete({ where: { key } });
  }
}
