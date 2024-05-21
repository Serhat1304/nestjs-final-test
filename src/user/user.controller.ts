import { Controller, Post, Body, Get, Query, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async addUser(@Body('email') email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException("Adresse e-mail invalide.");
    }

    try {
      await this.userService.addUser(email);
    } catch (error) {
      this.logger.error(`Échec de l'ajout de l'utilisateur : ${error.message}`, error.stack);
      throw new ConflictException("L'utilisateur existe déjà.");
    }
  }

  @Get()
  async getUser(@Query('email') email: string): Promise<any> {
    const user = await this.userService.getUser(email);
    if (!user) {
      throw new BadRequestException("Utilisateur non trouvé.");
    }
    return user;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
