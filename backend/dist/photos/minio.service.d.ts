import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private configService;
    private client;
    private bucket;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(filename: string, buffer: Buffer, mimetype: string): Promise<string>;
    getPresignedUrl(filename: string): Promise<string>;
    getFileStream(filename: string): Promise<any>;
    deleteFile(filename: string): Promise<void>;
}
