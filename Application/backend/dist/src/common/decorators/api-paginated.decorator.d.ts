import { Type } from '@nestjs/common';
export declare const ApiPaginated: <TModel extends Type<any>>(model: TModel) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
