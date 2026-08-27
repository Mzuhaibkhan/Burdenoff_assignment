import React, { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import { Calendar, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const GET_HOLIDAYS = `
  query GetHolidays {
    holidays {
      id
      date
      name
    }
  }
`;

const ADD_HOLIDAY = `
  mutation AddHoliday($date: String!, $name: String!) {
    addHoliday(date: $date, name: $name) {
      id
      date
      name
    }
  }
`;

const UPDATE_HOLIDAY = `
  mutation UpdateHoliday($id: ID!, $date: String, $name: String) {
    updateHoliday(id: $id, date: $date, name: $name) {
      id
      date
      name
    }
  }
`;

const REMOVE_HOLIDAY = `
  mutation RemoveHoliday($id: ID!) {
    removeHoliday(id: $id)
  }
`;

export default function HolidaysPage() {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_HOLIDAYS });
  const [, addHoliday] = useMutation(ADD_HOLIDAY);
  const [, updateHoliday] = useMutation(UPDATE_HOLIDAY);
  const [, removeHoliday] = useMutation(REMOVE_HOLIDAY);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    
    await addHoliday({ name, date });
    setName('');
    setDate('');
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const startEdit = (holiday: any) => {
    setEditingId(holiday.id);
    setEditName(holiday.name);
    // Format date string for the input (YYYY-MM-DD)
    const dateObj = new Date(holiday.date);
    const dateStr = dateObj.toISOString().split('T')[0];
    setEditDate(dateStr);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName || !editDate) return;
    await updateHoliday({ id: editingId, name: editName, date: editDate });
    setEditingId(null);
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleDelete = async (id: string) => {
    await removeHoliday({ id });
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  if (fetching) return <div style={{ padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>Loading holidays...</div>;
  if (error) return <div style={{ padding: 'var(--space-6)', color: 'var(--accent-red)' }}>Error loading holidays: {error.message}</div>;

  const holidays = data?.holidays || [];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 'var(--content-max-width)', margin: '0 auto', animation: 'fadeIn var(--transition-base)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Calendar size={32} color="var(--accent-purple)" />
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: '#fff' }}>Business Holidays</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
        {/* Holidays List */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: '#fff' }}>Upcoming Holidays</h2>
          
          {holidays.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No holidays configured.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {holidays.map((holiday: any) => (
                <div key={holiday.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  {editingId === holiday.id ? (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, marginRight: 'var(--space-4)' }}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ flex: 1, padding: 'var(--space-2)', background: 'var(--bg-secondary)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-sm)', color: '#fff', outline: 'none' }}
                      />
                      <input 
                        type="date" 
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        style={{ padding: 'var(--space-2)', background: 'var(--bg-secondary)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-sm)', color: '#fff', outline: 'none', colorScheme: 'dark' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 'var(--text-lg)' }}>{holiday.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {editingId === holiday.id ? (
                      <>
                        <button 
                          onClick={handleUpdate}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}
                          title="Save"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}
                          title="Cancel"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEdit(holiday)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          title="Edit Holiday"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(holiday.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.color = 'var(--accent-red)'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          title="Remove Holiday"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Holiday Form */}
        <div className="glass-card" style={{ padding: 'var(--space-6)', height: 'fit-content' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: '#fff' }}>Add Holiday</h2>
          
          <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Holiday Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. New Year's Day"
                style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none', colorScheme: 'dark' }}
                required
              />
            </div>
            
            <button 
              type="submit"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-3)', background: 'var(--gradient-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 600, cursor: 'pointer', marginTop: 'var(--space-2)', transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={18} />
              Add Holiday
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
