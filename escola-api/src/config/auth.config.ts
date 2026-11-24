import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET || 'chave_secreta_padrao',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));