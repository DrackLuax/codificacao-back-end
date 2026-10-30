import { IsString, 
         IsNotEmpty,
         IsInt,
         Min,
         IsArray,
         ArrayMinSize } from "class-validator";


export class CreateAlunoDto {
    @IsString()
    @IsNotEmpty({
        message:'O nome é obrigatório e não pode estar vazio!'
    })
    nome: string;

    
    @IsInt({
        message:'A idade deve ser um número inteiro.'
    })
    @Min(0,{
        message:'A idade não pode ser negativa.'
    })
    idade: number;


    @IsString()
    @IsNotEmpty({
        message:'A Matricula é Obrigatória'
    })
    matricula: string;


    @IsString({each: true, message:'Cada curso deve ser um texto.'})
    @IsArray()
    @ArrayMinSize(1,{message:'O aluno deve estar matriculado em pelo menos um curso'})
    cursos: string[];
}