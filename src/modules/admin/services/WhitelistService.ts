import fs from "fs/promises";
import path from "path";
import { UserAccess } from "../dto/UserAccess";

const WHITELIST_FILE = path.resolve(__dirname, "../../../data/whitelist.json");

export class WhitelistService {
  // Чтение файла whitelist.json
  private async readWhitelist(): Promise<UserAccess[]> {
    try {
      const data = await fs.readFile(WHITELIST_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error: any) {
      // Если файла нет — возвращаем пустой список
      if (error.code === "ENOENT") {
        console.warn("Файл whitelist.json не найден. Используется пустой список.");
        return [];
      }
      console.error("Ошибка при чтении whitelist.json:", error);
      throw error;
    }
  }

  // Запись файла whitelist.json, с автосозданием папки
  private async writeWhitelist(whitelist: UserAccess[]): Promise<void> {
    try {
      const dir = path.dirname(WHITELIST_FILE);
      await fs.mkdir(dir, { recursive: true }); // Создание папки, если её нет

      await fs.writeFile(WHITELIST_FILE, JSON.stringify(whitelist, null, 2), "utf-8");
      console.log("Whitelist успешно сохранён:", WHITELIST_FILE);
    } catch (error) {
      console.error("Ошибка при записи whitelist.json:", error);
      throw error;
    }
  }

  // Получить всех пользователей из вайтлиста
  async listUsers(): Promise<UserAccess[]> {
    return this.readWhitelist();
  }

  // Добавить пользователя, если его нет
  async addUser(user: UserAccess): Promise<void> {
    const whitelist = await this.readWhitelist();
    if (!whitelist.find(u => u.identifierValue === user.identifierValue)) {
      whitelist.push(user);
      await this.writeWhitelist(whitelist);
    } else {
      console.log(`Пользователь ${user.identifierValue} уже в вайтлисте`);
    }
  }

  // Удалить пользователя по идентификатору
  async removeUser(identifierValue: string): Promise<void> {
    let whitelist = await this.readWhitelist();
    whitelist = whitelist.filter(u => u.identifierValue !== identifierValue);
    await this.writeWhitelist(whitelist);
  }
}