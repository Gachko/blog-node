import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [
    TagService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class TagModule {}
