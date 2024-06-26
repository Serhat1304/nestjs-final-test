import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async addUser(email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException("L'adresse e-mail est invalide.");
    }

    const existingUser = await this.prismaService.getPrismaClient().user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("L'utilisateur existe déjà.");
    }

    await this.prismaService.getPrismaClient().user.create({ data: { email } });
    this.logger.log(`Utilisateur crée: email=${email}`);
  }

  async getUser(email: string): Promise<any> {
    const user = await this.prismaService.getPrismaClient().user.findUnique({ where: { email } });
    this.logger.log(`Utilisateur retrouvé: ${JSON.stringify(user)}`);
    return user;
  }

  async resetData(): Promise<void> {
    const prisma = this.prismaService.getPrismaClient();
    try {
      await prisma.$transaction(async (trans) => {
        await trans.user.deleteMany();
      });
      this.logger.log('Réinitialisation des données des utilisateurs terminée');
    } catch (error) {
      this.logger.error("Échec de la réinitialisation des données", error.stack);
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
