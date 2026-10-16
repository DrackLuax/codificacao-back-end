import { PipeTransform,
         ArgumentMetadata,
         BadRequestException } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor(private z: z.ZodType ){}
    transform(value: unknown, metadata: ArgumentMetadata) {
        if(metadata.type !== 'body') return value;
        const parseResult = this.z.safeParse(value);
        if(!parseResult.success){
            const formatedErrors = parseResult.error.issues.map((issue) => ({
                campo: issue.path.join('.'),
                mensagem: issue.message,
            }));
            throw new BadRequestException({
                statusCode:400,
                erros: formatedErrors,
            });

        }
        return parseResult.data;
    }

}