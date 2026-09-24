import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class JogosService {
    private jogos = [
        {id: 1, titulo: 'Roblox', estudio: 'Roblox Studios'},
        {id: 2, titulo: 'Minecraft', estudio: 'Mojang Studios'},
        {id: 3, titulo: 'Half Life', estudio: 'Valve Corporation'},
        {id: 4, titulo: 'Skyrim', estudio: 'Bethesda'},
        {id: 5, titulo: 'Free Fire', estudio: 'Garena'},
    ];

    buscarPorId(id:number){
        const jogo = this.jogos.find((j) => j.id === id);
        if(!jogo){
            throw new NotFoundException(`Jogo com ID ${id} não localizado em nosso estoque.`)
        }
        return jogo;
    }
}