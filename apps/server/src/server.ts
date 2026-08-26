import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { createContext } from './context';
import { resolvers } from './graphql/resolvers';
import { env } from './env';

// Load all .graphql SDL files
const typeDefs = mergeTypeDefs(
  loadFilesSync('src/graphql/schema/**/*.graphql', { cwd: import.meta.dir + '/..' })
);

const schema = createSchema({ typeDefs, resolvers: resolvers as any });

const yoga = createYoga({
  schema,
  context: ({ request }) => createContext(request as any),
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  },
  graphiql: env.NODE_ENV === 'development',  // GraphiQL explorer in dev only
  maskedErrors: env.NODE_ENV === 'production',
  logging: env.NODE_ENV === 'development' ? 'debug' : 'info',
});

const server = Bun.serve({
  port: env.PORT,
  fetch: yoga.fetch,
});

console.log(`🚀 BurdenOff GraphQL server running at http://localhost:${server.port}/graphql`);
