import { Expose } from 'class-transformer'

export class FileUploadResponseDTO {
  @Expose()
  file_key: string
}
