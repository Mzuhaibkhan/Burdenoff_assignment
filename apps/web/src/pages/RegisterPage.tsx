import React, { useState } from 'react';
import { useMutation } from 'urql';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const RegisterMutation = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id name email role }
    }
  }
`;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('REPORTER');
  const [error, setError] = useState('');
  const [{ fetching }, executeMutation] = useMutation(RegisterMutation);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await executeMutation({ input: { name, email, password, role } });
    if (result.error) {
      setError(result.error.message.replace('[GraphQL] ', ''));
    } else if (result.data?.register) {
      login(result.data.register.token, result.data.register.user);
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 'var(--space-4)' }}>
      <div className="glass-card" style={{ padding: 'var(--space-8)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>Create Account</h1>
        {error && <div style={{ color: 'var(--accent-red)', background: 'var(--sla-breached-bg)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="Name" required value={name} onChange={e => setName(e.target.value)} />
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
          <Select label="Role" options={[{label: 'Reporter', value: 'REPORTER'}, {label: 'Agent', value: 'AGENT'}]} value={role} onChange={e => setRole(e.target.value)} />
          <Button type="submit" isLoading={fetching} style={{ marginTop: 'var(--space-2)' }}>Register</Button>
        </form>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
