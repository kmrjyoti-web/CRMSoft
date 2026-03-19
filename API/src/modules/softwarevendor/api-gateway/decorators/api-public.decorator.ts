import { SetMetadata } from '@nestjs/common';

export const API_PUBLIC_KEY = 'api_public';
export const ApiPublic = () => SetMetadata(API_PUBLIC_KEY, true);
