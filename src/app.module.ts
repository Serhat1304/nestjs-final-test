import { AppRoutingModule } from './app.routing-module';
import { ConfigurationModule } from './infrastructure/configuration/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { Module, Logger } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { TaskController } from './task/task.controller';
import { UserService } from './user/user.service';
import { TaskService } from './task/task.service';

@Module({
    imports: [AppRoutingModule, ConfigurationModule, DatabaseModule, PrismaModule],
    controllers : [UserController, TaskController],
    providers : [Logger, UserService, TaskService]
})
export class AppModule {
    constructor(private readonly log: Logger) {}

    async onApplicationBootstrap() {
        const port = process.env.PORT
        this.log.log(`Le serveur a démarré avec succès ! Écoute sur le port ${port}`, 'Bootstrap')
    }
}
