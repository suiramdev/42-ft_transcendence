export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  createdAt: Date;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  ownerId: string;
  password?: string;
  members: ChatMember[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ChannelType {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Direct = 'DIRECT',
}

export interface ChatMember {
  userId: string;
  channelId: string;
  role: ChatMemberRole;
  mutedUntil?: Date;
}

export enum ChatMemberRole {
  Owner = 'OWNER',
  Admin = 'ADMIN',
  Member = 'MEMBER',
}
