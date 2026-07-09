import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<import("../database/entities/user.entity").User>;
    findAll(): Promise<import("../database/entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../database/entities/user.entity").User>;
    update(id: string, dto: UpdateUserDto): Promise<import("../database/entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
