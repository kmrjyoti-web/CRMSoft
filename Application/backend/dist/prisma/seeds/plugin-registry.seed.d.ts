import { PrismaClient } from '@prisma/client';
export declare function seedPluginRegistry(prisma: PrismaClient): Promise<number>;
export declare const PLUGIN_SEED_DATA: ({
    code: string;
    name: string;
    description: string;
    category: "COMMUNICATION";
    configSchema: {
        fields: {
            name: string;
            label: string;
            type: string;
            required: boolean;
        }[];
    };
    hookPoints: string[];
    menuCodes: string[];
    webhookConfig: {
        inbound: string;
        verificationMethod: string;
        signatureHeader?: undefined;
    };
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "COMMUNICATION";
    configSchema: {
        fields: never[];
    };
    oauthConfig: {
        authUrl: string;
        tokenUrl: string;
        scopes: string[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "COMMUNICATION";
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            default?: undefined;
            options?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            required: boolean;
            default: number;
            options?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            options: string[];
            default: string;
            required?: undefined;
        })[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "PAYMENT";
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            options?: undefined;
            default?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            options: string[];
            default: string;
            required?: undefined;
        })[];
    };
    hookPoints: string[];
    menuCodes: string[];
    webhookConfig: {
        inbound: string;
        verificationMethod: string;
        signatureHeader: string;
    };
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "ANALYTICS";
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            default: string;
        } | {
            name: string;
            label: string;
            type: string;
            required: boolean;
            default: number;
        } | {
            name: string;
            label: string;
            type: string;
            required: boolean;
            default?: undefined;
        })[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "ANALYTICS";
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            options?: undefined;
            default?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            options: string[];
            default: string;
            required?: undefined;
        })[];
    };
    hookPoints: string[];
    menuCodes: string[];
    webhookConfig: {
        inbound: string;
        verificationMethod: string;
        signatureHeader: string;
    };
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "CALENDAR";
    configSchema: {
        fields: never[];
    };
    oauthConfig: {
        authUrl: string;
        tokenUrl: string;
        scopes: string[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "TELEPHONY";
    configSchema: {
        fields: {
            name: string;
            label: string;
            type: string;
            required: boolean;
        }[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "STORAGE";
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            default?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            required: boolean;
            default: string;
        })[];
    };
    hookPoints: never[];
    menuCodes: never[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "STORAGE";
    configSchema: {
        fields: never[];
    };
    oauthConfig: {
        authUrl: string;
        tokenUrl: string;
        scopes: string[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    isPremium?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "AI";
    isPremium: boolean;
    configSchema: {
        fields: ({
            name: string;
            label: string;
            type: string;
            required: boolean;
            options?: undefined;
            default?: undefined;
        } | {
            name: string;
            label: string;
            type: string;
            options: string[];
            default: string;
            required?: undefined;
        })[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
} | {
    code: string;
    name: string;
    description: string;
    category: "MARKETING";
    configSchema: {
        fields: {
            name: string;
            label: string;
            type: string;
            required: boolean;
        }[];
    };
    hookPoints: string[];
    menuCodes: string[];
    iconUrl: string;
    setupGuideUrl: string;
    sortOrder: number;
    webhookConfig?: undefined;
    oauthConfig?: undefined;
    isPremium?: undefined;
})[];
