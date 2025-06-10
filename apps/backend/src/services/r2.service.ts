import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'

@Injectable()
export class R2Service {
  private client: S3Client
  bucket_name: string

  constructor(private configService: ConfigService) {
    const access_key_id = configService.get('r2.access_key_id')
    const access_key_secret = configService.get('r2.access_key_secret')
    const endpoint = configService.get('r2.endpoint')
    this.bucket_name = configService.get('r2.bucket_name')

    this.client = new S3({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: access_key_id,
        secretAccessKey: access_key_secret,
      },
    })
  }

  async stream_to_buffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    return Buffer.concat(chunks)
  }

  async upload_file({
    key,
    body,
    content_type,
  }: {
    key: string
    body: Buffer | Readable
    content_type: string
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket_name,
      Key: key,
      Body: body,
      ContentType: content_type,
    })

    const result = await this.client.send(command)

    return result
  }

  async get_file(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucket_name,
      Key: key,
    })

    const response = await this.client.send(command)

    return response
  }
}
