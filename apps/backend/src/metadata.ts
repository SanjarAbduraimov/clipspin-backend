import { ProjectType } from './models/project.schema'

/* eslint-disable */
export default async () => {
  const t = {
    ['./models/project.schema']: await import('./models/project.schema'),
  }
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./models/otp.schema'),
          {
            OTP: {
              code: { required: true, type: () => Number },
              code_hash: { required: true, type: () => String },
              email: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./models/user.schema'),
          {
            User: {
              full_name: { required: false, type: () => String },
              email: { required: false, type: () => String },
              password: { required: true, type: () => String },
              status: { required: false, type: () => Object },
              deleted_at: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./api/auth/dto/otp.dto'),
          {
            SendOTPPhoneNumberDTO: {
              phone_number: { required: true, type: () => String },
            },
            SendOTPPhoneEmailDTO: {
              email: { required: true, type: () => String },
            },
            OTPResponseDTO: {
              code: { required: true, type: () => String },
              code_hash: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./api/auth/dto/singin.dto'),
          {
            SignInDTO: {
              email: { required: true, type: () => String },
              code: { required: true, type: () => Number },
              code_hash: { required: true, type: () => String },
            },
            SignInResponseDTO: {
              access_token: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./api/profile/dto/response.dto'),
          {
            ProfileResponseDTO: {
              _id: { required: true, type: () => String },
              full_name: { required: true, type: () => String },
              email: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./api/profile/dto/update.dto'),
          {
            UpdateProfileDTO: {
              full_name: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./models/project.schema'),
          {
            Project: {
              title: { required: true, type: () => String },
              input_video_url: { required: true, type: () => String },
              user: {
                required: true,
                type: () => require('mongoose').Types.ObjectId,
              },
              status: {
                required: false,
                enum: t['./models/project.schema'].ProjectStatus,
              },
            },
          },
        ],
        [
          import('./api/projects/dto/create.dto'),
          {
            CreateProjectDTO: {
              title: { required: true, type: () => String },
              input_video_url: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./api/projects/dto/response.dto'),
          {
            ProjectResponseDTO: {
              _id: { required: true, type: () => String },
              title: { required: true, type: () => String },
              input_video_url: { required: true, type: () => String },
              status: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./api/projects/dto/update.dto'),
          {
            UpdateProjectDTO: {
              title: { required: false, type: () => String },
              input_video_url: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./models/credit-config.schema'),
          {
            CreditConfig: {
              project_type: { required: true, type: () => String },
              credit_cost: { required: true, type: () => Number },
              description: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./api/credit-config/dto/create.dto'),
          {
            CreateCreditConfigDTO: {
              project_type: {
                required: true,
                enum: ProjectType,
              },
              credit_cost: { required: true, type: () => Number },
              description: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./api/credit-config/dto/update.dto'),
          {
            UpdateCreditConfigDTO: {
              project_type: {
                required: false,
                enum: ProjectType,
              },
              credit_cost: { required: false, type: () => Number },
              description: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./api/credit-config/dto/response.dto'),
          {
            CreditConfigResponseDTO: {
              _id: { required: true, type: () => String },
              project_type: { required: true, type: () => String },
              credit_cost: { required: true, type: () => Number },
              description: { required: false, type: () => String },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./api/auth/auth.controller'),
          { AuthController: { sendEmailOTP: {}, signin: {} } },
        ],
        [
          import('./api/profile/profile.controller'),
          { ProfileController: { get: {}, update: {} } },
        ],
        [
          import('./api/projects/project.controller'),
          {
            ProjectController: {
              getAll: {},
              get: {},
              create: {},
              update: {},
              delete: {},
            },
          },
        ],
        [
          import('./api/credit-config/credit-config.controller'),
          {
            CreditConfigController: {
              getAll: {},
              get: {},
              create: {},
              update: {},
              delete: {},
            },
          },
        ],
      ],
    },
  }
}
