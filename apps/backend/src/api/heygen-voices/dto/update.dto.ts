import { PartialType } from '@nestjs/swagger'

import { CreateHeygenVoiceDTO } from './create.dto'

export class UpdateHeygenVoiceDTO extends PartialType(CreateHeygenVoiceDTO) {}
