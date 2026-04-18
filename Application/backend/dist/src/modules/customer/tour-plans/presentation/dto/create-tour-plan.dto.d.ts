declare class VisitDto {
    leadId?: string;
    contactId?: string;
    scheduledTime?: string;
    sortOrder?: number;
}
export declare class CreateTourPlanDto {
    title: string;
    planDate: string;
    leadId: string;
    description?: string;
    startLocation?: string;
    endLocation?: string;
    visits?: VisitDto[];
}
export {};
