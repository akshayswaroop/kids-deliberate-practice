

interface ProfileFormProps {
  users: Record<string, any>;
  currentUserId: string | null;
  onCreateUser: (username: string, displayName?: string) => void;
  onSwitchUser: (userId: string) => void;
  compact?: boolean;
  // Controlled form state
  username: string;
  onUsernameChange: (username: string) => void;
  showCreateForm: boolean;
  onToggleCreateForm: (show: boolean) => void;
}

export default function ProfileForm({ 
  users, 
  currentUserId, 
  onCreateUser, 
  onSwitchUser, 
  compact = false,
  username,
  onUsernameChange,
  showCreateForm,
  onToggleCreateForm
}: ProfileFormProps) {
  const userIds = Object.keys(users);

  return (
    <div style={{ marginBottom: compact ? 0 : 32, display: 'flex', alignItems: 'center', gap: compact ? 8 : 12, flexWrap: 'wrap' }}>
      {/* User Selection */}
      <select 
        id="user-select" 
        value={currentUserId ?? ''} 
        onChange={e => { if (e.target.value) onSwitchUser(e.target.value); }} 
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
        <option value="">— Select or create user —</option>
        {userIds.map(uid => (
          <option key={uid} value={uid}>{users[uid]?.displayName || uid}</option>
        ))}
      </select>
      
      {/* Add User Button */}
      {!showCreateForm ? (
        <button
          onClick={() => onToggleCreateForm(true)}
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
            onChange={e => onUsernameChange(e.target.value)}
            style={{ 
              padding: compact ? '6px 12px' : '8px 16px', 
              borderRadius: 8, 
              border: 'none',
              fontSize: compact ? '14px' : '16px',
              minWidth: '100px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && username.trim() && !users[username.trim()]) {
                const id = `user_${Date.now()}`;
                onCreateUser(id, username.trim());
                onUsernameChange('');
                onToggleCreateForm(false);
              }
            }}
          />
          <button
            onClick={() => {
              if (username.trim() && !users[username.trim()]) {
                const id = `user_${Date.now()}`;
                onCreateUser(id, username.trim());
                onUsernameChange('');
                onToggleCreateForm(false);
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
              onToggleCreateForm(false);
              onUsernameChange('');
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
