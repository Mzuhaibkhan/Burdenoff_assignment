import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema/**/*.graphql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context#GraphQLContext',
        mappers: {
          Ticket: '@prisma/client#Ticket as TicketModel',
          User: '@prisma/client#User as UserModel',
          Comment: '@prisma/client#Comment as CommentModel',
          Holiday: '@prisma/client#Holiday as HolidayModel',
        },
        enumsAsTypes: false,
        useIndexSignature: true,
        scalars: {
          DateTime: 'string',
        },
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
      },
    },
  },
};

export default config;
