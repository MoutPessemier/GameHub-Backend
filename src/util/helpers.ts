import * as bcript from 'bcrypt';

export const hashPassword = async (password: string) => {
  const hashedPass = await bcript.hash(password, 10);
  return hashedPass;
};
