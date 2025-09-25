import { useState } from 'react';

interface ProfileFormProps {
  users: Record<string, any>;
  currentUserId: string;
  onCreateUser: (username: string) => void;
  onSwitchUser: (userId: string) => void;
  compact?: boolean;
}

export default function ProfileForm({ users, currentUserId, onCreateUser, onSwitchUser, compact = false }: ProfileFormProps) {
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const userIds = Object.keys(users);

  return (
    <div style={{ marginBottom: compact ? 0 : 32, display: 'flex', alignItems: 'center', gap: compact ? 8 : 12, flexWrap: 'wrap' }}>
      {/* User Selection */}
      <select 
        id="user-select" 
        value={currentUserId} 
        onChange={e => onSwitchUser(e.target.value)} 
        style={{ 
          padding: compact ? '6px 12px' : '8px 16px', 
          borderRadius: 8, 
          border: 'none',
          fontSize: compact ? '14px' : '16px',
          fontWeight: 600,
          minWidth: '120px',
          background: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {userIds.map(uid => (
          <option key={uid} value={uid}>{uid}</option>
        ))}
      </select>
      
      {/* Add User Button */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{ 
            background: '#4f46e5', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: 8, 
            padding: compact ? '6px 12px' : '8px 16px', 
            fontSize: compact ? '14px' : '16px',
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          + Add User
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Enter name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ 
              padding: compact ? '6px 12px' : '8px 16px', 
              borderRadius: 8, 
              border: 'none',
              fontSize: compact ? '14px' : '16px',
              minWidth: '100px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && username.trim() && !users[username.trim()]) {
                onCreateUser(username.trim());
                setUsername('');
                setShowCreateForm(false);
              }
            }}
          />
          <button
            onClick={() => {
              if (username.trim() && !users[username.trim()]) {
                onCreateUser(username.trim());
                setUsername('');
                setShowCreateForm(false);
              }
            }}
            style={{ 
              background: '#4ade80', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: compact ? '6px 12px' : '8px 16px', 
              fontSize: compact ? '14px' : '16px',
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
            disabled={!username.trim() || !!users[username.trim()]}
          >
            ✓
          </button>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setUsername('');
            }}
            style={{ 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: compact ? '6px 12px' : '8px 16px', 
              fontSize: compact ? '14px' : '16px',
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            ✗
          </button>
        </div>
      )}
    </div>
  );
}
