import { WhitelistService } from "../services/WhitelistService";
import { UserAccess } from "../dto/UserAccess";

export class ListUserAccessAction {
  private whitelistService = new WhitelistService();

  async execute(): Promise<UserAccess[]> {
    return this.whitelistService.listUsers();
  }
}
// 12