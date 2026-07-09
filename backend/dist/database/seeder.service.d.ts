import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SeederService implements OnApplicationBootstrap {
    private dataSource;
    constructor(dataSource: DataSource);
    onApplicationBootstrap(): Promise<void>;
    seed(): Promise<void>;
}
