export declare class ListHelpArticlesQueryDto {
    page?: number;
    limit?: number;
    helpType?: 'DEVELOPER' | 'USER';
    moduleCode?: string;
    screenCode?: string;
    fieldCode?: string;
    isPublished?: boolean;
    search?: string;
}
export declare class ContextualHelpQueryDto {
    moduleCode: string;
    screenCode?: string;
    fieldCode?: string;
}
export declare class CreateHelpArticleDto {
    articleCode: string;
    title: string;
    content: string;
    summary: string;
    helpType: 'DEVELOPER' | 'USER';
    moduleCode?: string;
    screenCode?: string;
    fieldCode?: string;
    applicableTypes?: Record<string, unknown>;
    usesTerminology?: boolean;
    videoUrl?: string;
    videoThumbnail?: string;
    relatedArticles?: Record<string, unknown>;
    visibleToRoles?: Record<string, unknown>;
    tags?: Record<string, unknown>;
    isPublished?: boolean;
}
export declare class UpdateHelpArticleDto {
    title?: string;
    content?: string;
    summary?: string;
    helpType?: 'DEVELOPER' | 'USER';
    moduleCode?: string;
    screenCode?: string;
    fieldCode?: string;
    applicableTypes?: Record<string, unknown>;
    usesTerminology?: boolean;
    videoUrl?: string;
    videoThumbnail?: string;
    relatedArticles?: Record<string, unknown>;
    visibleToRoles?: Record<string, unknown>;
    tags?: Record<string, unknown>;
    isPublished?: boolean;
}
