import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMediaFileDto {
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedBy?: string;
}

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMediaFileDto) {
    return this.prisma.mediaFile.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException(`Media file "${id}" not found`);
    }
    return file;
  }

  async delete(id: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException(`Media file "${id}" not found`);
    }
    return this.prisma.mediaFile.delete({
      where: { id },
    });
  }
}
