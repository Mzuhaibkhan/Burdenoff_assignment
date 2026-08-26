import React, { useState } from 'react';
import { useMutation } from 'urql';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const LoginMutation = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id name email role }
    }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [{ fetching }, executeMutation] = useMutation(LoginMutation);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await executeMutation({ input: { email, password } });
    if (result.error) {
      setError(result.error.message.replace('[GraphQL] ', ''));
    } else if (result.data?.login) {
      login(result.data.login.token, result.data.login.user);
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 'var(--space-4)' }}>
      <div className="glass-card" style={{ padding: 'var(--space-8)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>Welcome Back</h1>
        {error && <div style={{ color: 'var(--accent-red)', background: 'var(--sla-breached-bg)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          <Button type="submit" isLoading={fetching} style={{ marginTop: 'var(--space-2)' }}>Login</Button>
        </form>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
