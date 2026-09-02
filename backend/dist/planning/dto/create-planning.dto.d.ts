export declare class CreatePlanningDto {
    year: number;
    week: number;
    dayOfWeek: number;
    missionId: string;
    employeeIds?: string[];
    teamLeaderId?: string;
    notes?: string;
}
