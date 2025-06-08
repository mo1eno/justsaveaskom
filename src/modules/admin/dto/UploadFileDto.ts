/**
 * UploadFileDto:
 * DTO для загружаемого файла с данными CRM.
 */
export interface UploadFileDto {
  filename: string;
  content: string; // содержимое файла в виде строки (JSON)
  mimeType: string;
}
