import bcrypt from 'bcrypt';

export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
}

export class BcryptPasswordService implements IPasswordService {
  async hash(password: string) { return await bcrypt.hash(password, 10); }
  async verify(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }
}

export class TestPasswordService implements IPasswordService {
  async hash(password: string) { return `encrypted<${password}>` }
  async verify(password: string, passwordHash: string) {
    return (await this.hash(password)) == passwordHash;
  }
}
