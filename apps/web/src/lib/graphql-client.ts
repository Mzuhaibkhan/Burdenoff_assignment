import { Client, cacheExchange, fetchExchange } from 'urql';

export const graphqlClient = new Client({
  url: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('burdenoff_token');
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
});
