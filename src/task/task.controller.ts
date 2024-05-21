import { Controller, Post, Body, Get, Param, BadRequestException, Logger } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(@Body() body: any): Promise<void> {
    const { name, userId, priority } = body;
    
    if (!name || !userId || isNaN(priority) || priority < 1) {
      throw new BadRequestException('Données de tâche invalides.');
    }

    try {
      this.logger.log(`Création de la tâche avec nom=${name}, utilisateurId=${userId}, priorité=${priority}`);
      await this.taskService.addTask(name, parseInt(userId, 10), parseInt(priority, 10));
    } catch (error) {
      this.logger.error(`Échec de la création de la tâche : ${error.message}`, error.stack);
      throw new BadRequestException('Impossible de créer la tâche.');
    }
  }

  @Get('/user/:userId')
  async getUserTasks(@Param('userId') userId: string): Promise<any[]> {
    const numericUserId = parseInt(userId, 10); //Récupération de l'Id depuis l'URL
    if (!this.isValidUserId(numericUserId)) {
      throw new BadRequestException('ID utilisateur invalide.');
    }
    this.logger.log(`Récupération des tâches pour l'utilisateur ID : ${numericUserId}`);
    const tasks = await this.taskService.getUserTasks(numericUserId);
    this.logger.log(`Tâches récupérées : ${JSON.stringify(tasks)}`);
    return tasks;
  }

  private isValidUserId(userId: number): boolean {
    return Number.isInteger(userId) && userId > 0;
  }
}
