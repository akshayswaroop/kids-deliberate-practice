export interface ProfileFormProps {
  users: Record<string, any>;
  currentUserId: string;
  onCreateUser: (username: string) => void;
  onSwitchUser: (userId: string) => void;
}