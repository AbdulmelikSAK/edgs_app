export declare enum RoleName {
    ADMIN = "admin",
    MANAGER = "manager",
    DRIVER = "driver"
}
export declare class Role {
    id: string;
    name: RoleName;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
