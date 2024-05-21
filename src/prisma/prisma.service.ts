import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connecté');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma déconnecté');
  }

  getPrismaClient(): PrismaClient {
    return this;
  }
}
