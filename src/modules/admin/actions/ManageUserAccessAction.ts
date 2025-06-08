import { WhitelistService } from "../services/WhitelistService";
import { ManageUserAccessDto } from "../dto/ManageUserAccessDto";

export class ManageUserAccessAction {
  private whitelistService = new WhitelistService();

  async execute(request: ManageUserAccessDto): Promise<void> {
    const { action, data } = request;

    if (action === "add") {
      await this.whitelistService.addUser(data);
    } else if (action === "remove") {
      await this.whitelistService.removeUser(data.identifierValue);
    }
  }
}
