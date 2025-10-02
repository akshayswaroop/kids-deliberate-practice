

interface UserOption {
  id: string;
  label: string;
}

interface ProfileFormProps {
  users: UserOption[];
  currentUserId: string | null;
  onCreateUser: (displayName?: string) => void;
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
  const hasDuplicateName = (name: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return false;
    return users.some(user => user.label?.toLowerCase() === normalized);
  };

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
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-soft)',
          transition: 'all 0.3s ease'
        }}
      >
        <option value="">— Select or create user —</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.label}</option>
        ))}
      </select>
      
      {/* Add User Button */}
      {!showCreateForm ? (
        <button
          onClick={() => onToggleCreateForm(true)}
          style={{ 
            background: 'var(--button-create-bg)', 
            color: 'var(--text-inverse)', 
            border: 'none', 
            borderRadius: 8, 
            padding: compact ? '6px 12px' : '8px 16px', 
            fontSize: compact ? '14px' : '16px',
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: 'var(--shadow-soft)'
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
              minWidth: '100px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && username.trim() && !hasDuplicateName(username)) {
                onCreateUser(username.trim());
                onUsernameChange('');
                onToggleCreateForm(false);
              }
            }}
          />
          <button
            onClick={() => {
              if (username.trim() && !hasDuplicateName(username)) {
                onCreateUser(username.trim());
                onUsernameChange('');
                onToggleCreateForm(false);
              }
            }}
            style={{ 
              background: 'var(--button-primary-bg)', 
              color: 'var(--text-inverse)', 
              border: 'none', 
              borderRadius: 8, 
              padding: compact ? '6px 12px' : '8px 16px', 
              fontSize: compact ? '14px' : '16px',
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.3s ease' 
            }}
            disabled={!username.trim() || hasDuplicateName(username)}
          >
            ✓
          </button>
          <button
            onClick={() => {
              onToggleCreateForm(false);
              onUsernameChange('');
            }}
            style={{ 
              background: 'var(--button-secondary-bg)', 
              color: 'var(--text-inverse)', 
              border: 'none', 
              borderRadius: 8, 
              padding: compact ? '6px 12px' : '8px 16px', 
              fontSize: compact ? '14px' : '16px',
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.3s ease' 
            }}
          >
            ✗
          </button>
        </div>
      )}
    </div>
  );
}
