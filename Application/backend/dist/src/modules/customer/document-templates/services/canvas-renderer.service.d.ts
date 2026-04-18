import { FormulaService } from './formula.service';
interface CanvasElement {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    properties: Record<string, any>;
}
interface CanvasBand {
    type: string;
    height: number;
    elements: CanvasElement[];
}
interface CanvasDesign {
    version: number;
    paper: {
        size: string;
        orientation: string;
        margins: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
    bands: CanvasBand[];
    formulas?: {
        id: string;
        name: string;
        expression: string;
    }[];
}
export declare class CanvasRendererService {
    private readonly formulaService;
    private readonly logger;
    constructor(formulaService: FormulaService);
    renderCanvasToHtml(design: CanvasDesign, data: Record<string, any>): string;
    private renderBand;
    private renderElement;
    private resolveValue;
    private renderTableElement;
    private getNestedValue;
    private flattenData;
}
export {};
