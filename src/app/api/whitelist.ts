import fs from "fs/promises";
import path from "path";
import { UserAccess } from "../../modules/admin/dto/UserAccess";

const WHITELIST_FILE = path.resolve(__dirname, "../../../data/whitelist.json");

export class WhitelistService {
  private async readWhitelist(): Promise<UserAccess[]> {
    try {
      const data = await fs.readFile(WHITELIST_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error reading whitelist:", error);
      return [];
    }
  }

  private async writeWhitelist(whitelist: UserAccess[]): Promise<void> {
    try {
      await fs.writeFile(WHITELIST_FILE, JSON.stringify(whitelist, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to whitelist:", error);
    }
  }

  async listUsers(): Promise<UserAccess[]> {
    return this.readWhitelist();
  }

  async addUser(user: UserAccess): Promise<void> {
    const whitelist = await this.readWhitelist();
    if (!this.isUserInWhitelist(user, whitelist)) {
      whitelist.push(user);
      await this.writeWhitelist(whitelist);
    }
  }

  async removeUser(identifierValue: string): Promise<void> {
    let whitelist = await this.readWhitelist();
    whitelist = whitelist.filter(u => u.identifierValue !== identifierValue);
    await this.writeWhitelist(whitelist);
  }

  private isUserInWhitelist(user: UserAccess, whitelist: UserAccess[]): boolean {
    return whitelist.some(u => u.identifierValue === user.identifierValue);
  }
}