// Talking Head Data Interfaces for Projects Collection
export interface TalkingHeadScene {
  scene_number?: number
  image_prompt?: string
  voiceover_script?: string
  image_url?: string
}

export interface TalkingHeadData {
  scenes?: TalkingHeadScene[]
}

// Heygen Video Generation Interfaces
export interface HeygenVoiceVariable {
  name: string
  type: 'voice'
  properties: {
    voice_id: string
    locale: string | null
  }
}

export interface HeygenAvatarVariable {
  name: string
  type: 'character'
  properties: {
    character_id: string
    type: 'avatar'
  }
}

export interface HeygenImageVariable {
  name: string
  type: 'image'
  properties: {
    url: string
    asset_id: string | null
    fit: 'none' | 'cover' | 'contain' | 'fill'
  }
}

export interface HeygenTextVariable {
  name: string
  type: 'text'
  properties: {
    content: string
  }
}

export type HeygenVariable = HeygenVoiceVariable | HeygenAvatarVariable | HeygenImageVariable | HeygenTextVariable

export interface HeygenGenerateVideoRequest {
  title: string
  variables: Record<string, HeygenVariable>
  test?: boolean
  caption?: boolean
  dimension: {
    width: number
    height: number
  }
}

export interface HeygenGenerateVideoParams {
  script: string
  title: string
  callback_id: string
  voice_id: string
  avatar_id: string
  variables?: Record<string, HeygenVariable>
  dimension?: {
    width: number
    height: number
  }
  test?: boolean
  caption?: boolean
}

// Helper function to create Heygen variables from TalkingHeadData
export function createHeygenVariablesFromTalkingHead(
  talkingHeadData: TalkingHeadData,
  voiceId: string,
  avatarId: string
): Record<string, HeygenVariable> {
  const variables: Record<string, HeygenVariable> = {}

  // Add voice variable
  variables.voice = {
    name: "voice",
    type: "voice",
    properties: {
      voice_id: voiceId,
      locale: null
    }
  }

  // Add avatar variable
  variables.avatar = {
    name: "avatar",
    type: "character",
    properties: {
      character_id: avatarId,
      type: "avatar"
    }
  }

  // Add image variables for each scene
  talkingHeadData.scenes.forEach((scene, index) => {
    if (scene.image_url) {
      variables[`image_${index + 1}`] = {
        name: `image_${index + 1}`,
        type: "image",
        properties: {
          url: scene.image_url,
          asset_id: null,
          fit: "none"
        }
      }
    }
  })

  // Add script variables for each scene
  talkingHeadData.scenes.forEach((scene, index) => {
    if (scene.voiceover_script) {
      variables[`script_${index + 1}`] = {
        name: `script_${index + 1}`,
        type: "text",
        properties: {
          content: scene.voiceover_script
        }
      }
    }
  })

  return variables
}