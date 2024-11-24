import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get<string>('database.mysql.host'),
        port: configService.get<number>('database.mysql.port'),
        username: configService.get<string>('database.mysql.username'),
        password: configService.get<string>('database.mysql.password'),
        database: configService.get<string>('database.mysql.database'),
        entities: [__dirname + '/../../../models/**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
