import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async addTask(name: string, userId: number, priority: number): Promise<void> {
    const user = await this.prismaService.getPrismaClient().user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`Utilisateur non trouvé pour l'ID fourni : ${userId}`);
      throw new BadRequestException(`Aucun utilisateur trouvé pour l'ID fourni : ${userId}`);
    }

    this.logger.log(`Création de la tâche : nom=${name}, utilisateurId=${userId}, priorité=${priority}`);

    await this.prismaService.getPrismaClient().task.create({
      data: {
        name,
        userId,
        priority,
      },
    });

    this.logger.log(`Tâche créée : nom=${name}`);
  }

  async getTaskByName(name: string): Promise<any> {
    this.logger.log(`Récupération de la tâche par nom : ${name}`);
    const task = await this.prismaService.getPrismaClient().task.findFirst({ where: { name } });
    this.logger.log(`Tâche récupérée : ${JSON.stringify(task)}`);
    return task;
  }

  async getUserTasks(userId: number): Promise<any[]> {
    const user = await this.prismaService.getPrismaClient().user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`Utilisateur non trouvé pour l'ID fourni : ${userId}`);
      throw new BadRequestException(`Aucun utilisateur trouvé pour l'ID fourni : ${userId}`);
    }

    const tasks = await this.prismaService.getPrismaClient().task.findMany({ where: { userId } });
    this.logger.log(`Tâches pour l'utilisateur ${userId} : ${JSON.stringify(tasks)}`);
    return tasks;
  }

  async resetData(): Promise<void> {
    const prisma = this.prismaService.getPrismaClient();
    try {
      await prisma.$transaction(async (trans) => {
        await trans.task.deleteMany();
      });
      this.logger.log('Réinitialisation des données des tâches terminée');
    } catch (error) {
      this.logger.error("Échec de la réinitialisation des données", error.stack);
      throw error;
    }
  }
}
