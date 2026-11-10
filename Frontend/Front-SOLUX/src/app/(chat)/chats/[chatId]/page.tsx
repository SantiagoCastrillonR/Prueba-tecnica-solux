import type { Metadata } from 'next';
import { ChatWindow } from '@/components/chat/ChatWindow';

export const metadata: Metadata = { title: 'Conversación' };

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <ChatWindow key={chatId} chatId={chatId} />;
}
