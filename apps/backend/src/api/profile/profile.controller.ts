import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { ResponseDTO } from '../../common/decarators/response.decarator'
import { User } from '../../common/decarators/user.decarator'
import { UserDocument } from '../../models/user.schema'
import { ProfileResponseDTO } from './dto/response.dto'
import { UpdateProfileDTO } from './dto/update.dto'
import { ProfileService } from './profile.service'

@ApiBearerAuth()
@ApiTags(ProfileController.resource_name)
@Controller('/api/profile')
export class ProfileController {
  static resource_name = 'profile'
  constructor(private readonly profile_service: ProfileService) {}

  @Get('/')
  @ResponseDTO(ProfileResponseDTO)
  async get(@User() user: UserDocument) {
    const profile = await this.profile_service.retrieve(user._id)

    return { data: profile }
  }

  @Put('/')
  @ResponseDTO(ProfileResponseDTO)
  async update(@User() user: UserDocument, @Body() body: UpdateProfileDTO) {
    const profile = await this.profile_service.update(user._id, body)

    return { data: profile }
  }
}
