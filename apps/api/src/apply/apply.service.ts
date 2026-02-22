import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface CreateApplyDto {
  name: string;
  email: string;
  phone: string;
  industry: string;
  message: string;
  fileUrl?: string;
}

@Injectable()
export class ApplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async create(dto: CreateApplyDto) {
    const created = await this.prisma.applicationSubmission.create({
      data: dto,
    });
    await this.email.notifyNewApplication(dto);
    return created;
  }

  async findAll() {
    return this.prisma.applicationSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.applicationSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException(`Application submission "${id}" not found`);
    }
    return submission;
  }

  async updateStatus(id: string, status: SubmissionStatus) {
    return this.prisma.applicationSubmission.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.prisma.applicationSubmission.delete({
      where: { id },
    });
    return { deleted: true };
  }
}
