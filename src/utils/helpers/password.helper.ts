import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// Generate a hashed password
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10));
};

// Compare a password with a hashed password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};