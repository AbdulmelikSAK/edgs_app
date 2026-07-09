import { Mission } from './mission.entity';
import { User } from './user.entity';
export declare enum ReportStatus {
    GENERATING = "generating",
    READY = "ready",
    ERROR = "error"
}
export declare class Report {
    id: string;
    mission: Mission;
    generatedBy: User;
    status: ReportStatus;
    url: string;
    filename: string;
    errorMessage: string;
    createdAt: Date;
}
