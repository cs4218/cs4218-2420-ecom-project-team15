import bcrypt from "bcrypt";

export const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
    try {
        const saltRounds = SALT_ROUNDS;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;

    } catch (error) {
        console.log(error);
    }
};

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
}