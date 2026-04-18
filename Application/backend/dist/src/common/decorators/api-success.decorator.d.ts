import { Type } from '@nestjs/common';
export declare const ApiSuccess: <TModel extends Type<any>>(model: TModel, statusCode?: 200 | 201) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
