import { SequenceResetPolicy } from '@prisma/working-client';
export declare class UpdateAutoNumberDto {
    prefix?: string;
    formatPattern?: string;
    seqPadding?: number;
    startFrom?: number;
    incrementBy?: number;
    resetPolicy?: SequenceResetPolicy;
}
export declare class ResetSequenceDto {
    newStart?: number;
}
