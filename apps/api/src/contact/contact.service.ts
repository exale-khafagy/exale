import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  concern: string;
  message: string;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async create(dto: CreateContactDto) {
    const created = await this.prisma.contactSubmission.create({
      data: dto,
    });
    await this.email.notifyNewContact(dto);
    return created;
  }

  async findAll() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException(`Contact submission "${id}" not found`);
    }
    return submission;
  }

  async updateStatus(id: string, status: SubmissionStatus) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
  }
}
