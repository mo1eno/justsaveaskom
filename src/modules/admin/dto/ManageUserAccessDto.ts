import { UserAccess } from "../../..//modules/admin/dto/UserAccess";

/**
 * ManageUserAccessDto:
 * DTO для управления доступом пользователей.
 */
export interface ManageUserAccessDto {
  action: 'add' | 'remove' | 'list';
  data: UserAccess;
}
