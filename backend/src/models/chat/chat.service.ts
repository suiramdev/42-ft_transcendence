import { Injectable } from '@nestjs/common';
import {
  type ChatMessage,
  type ChatChannel,
  ChannelType,
  ChatMemberRole,
} from './chat.types';

@Injectable()
export class ChatService {
  private channels = new Map<string, ChatChannel>();
  private messages: ChatMessage[] = [];

  createChannel(name: string, ownerId: string, type: ChannelType): ChatChannel {
    const channel: ChatChannel = {
      id: crypto.randomUUID(),
      name,
      type,
      ownerId,
      members: [
        {
          userId: ownerId,
          channelId: '', // Will be set after creation
          role: ChatMemberRole.Owner,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (channel.members[0]) {
      channel.members[0].channelId = channel.id;
    }

    this.channels.set(channel.id, channel);
    return channel;
  }

  addMessage(
    content: string,
    senderId: string,
    channelId: string,
  ): ChatMessage {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      senderId,
      channelId,
      createdAt: new Date(),
    };

    this.messages.push(message);
    return message;
  }
}
