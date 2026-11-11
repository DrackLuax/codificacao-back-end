import { IsString, 
         IsNotEmpty,
         IsInt,
         Min,
         IsArray,
         ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateAlunoDto {
    @ApiProperty({
        example: 'Leonardo Picanço Queiroz Fontinele',
        description: 'Nome do Aluno'
    })


    @IsString()
    @IsNotEmpty({
        message:'O nome é obrigatório e não pode estar vazio!'
    })
    nome: string;

    @ApiProperty({
        example: 20,
        description: 'Idade do Aluno'
    })
    @IsInt({
        message:'A idade deve ser um número inteiro.'
    })
    @Min(0,{
        message:'A idade não pode ser negativa.'
    })
    idade: number;

    @ApiProperty({
        example: '067',
        description: 'Matrícula do Aluno'
    })
    @IsString()
    @IsNotEmpty({
        message:'A Matricula é Obrigatória'
    })
    matricula: string;

    @ApiProperty({
        example: ['Engenharia da Computação'],
        description: 'Curso(s) do Aluno'
    })
    @IsString({each: true, message:'Cada curso deve ser um texto.'})
    @IsArray()
    @ArrayMinSize(1,{message:'O aluno deve estar matriculado em pelo menos um curso'})
    cursos: string[];
}