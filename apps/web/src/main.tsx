import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';
import { graphqlClient } from './lib/graphql-client';
import { AuthProvider } from './lib/auth';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <UrqlProvider value={graphqlClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </UrqlProvider>
    </BrowserRouter>
  </React.StrictMode>
);
