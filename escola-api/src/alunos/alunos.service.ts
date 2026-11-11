import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateAlunoDto } from "./dto/create-aluno.dto.js";
import { UpdateAlunoDto } from "./dto/update-aluno.dto.js";
import { Aluno, AlunoDoc } from "./schemas/aluno.schema.js";


@Injectable()
export class AlunosService {
    constructor(@InjectModel(Aluno.name) private alunoModel: Model<AlunoDoc>) {}
    //!CLUD
    //! C - Create (Criar)
    //! R - Read (Ler/Cosultar)
    //! U - Update (Atualizar)
    //! D - Delete (Apagar)

    async create(createAlunoDto: CreateAlunoDto): Promise<Aluno>{
        const createAluno = new this.alunoModel(createAlunoDto);
        return createAluno.save();
    }

    // async findAll(): Promise <Aluno[]>{
    //     return this.alunoModel.find().exec();
    // }

    //! Método para buscar os alunos com paginação
    async findPage(page: number, limit: number){
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.alunoModel.find().skip(skip).limit(limit).exec(),
            this.alunoModel.countDocuments().exec(),
        ]);
        return {
            data,
            meta:{
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    
    async findOne(id: string): Promise <Aluno>{
       const aluno = await this.alunoModel.findById(id).exec();
       if(!aluno){
        throw new NotFoundException(`Aluno com ID ${id} não encontrado.`);
       }
       return aluno;
    }

    async update(id: string, updateAlunoDto: UpdateAlunoDto):Promise<Aluno>{
        const alunoAtualizado = await this.alunoModel.findByIdAndUpdate(id, updateAlunoDto,{
            new: true }).exec();
            if(!alunoAtualizado){
                throw new NotFoundException(`Aluno com ID ${id} não encontrado.`);
            }
            return alunoAtualizado;
    }
    async remove(id: string): Promise<Aluno>{
        const alunoRemovido = await this.alunoModel.findByIdAndDelete(id).exec();
        if(!alunoRemovido){
            throw new NotFoundException(`Aluno com ID ${id} não encontrado.`)
        }
        return alunoRemovido;
    }
}