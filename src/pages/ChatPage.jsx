import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInput from '../components/chat/ChatInput';
import useChat from '../hooks/useChat';

/**
 * Main chat page component
 */
const ChatPage = () => {
  const { conversationId } = useParams();
  const { 
    conversations,
    messages,
    currentConversationId,
    isLoading,
    sendMessage,
    createNewConversation,
    setCurrentConversationId
  } = useChat(conversationId);

  return (
    <Layout
      showSidebar={true}
      sidebarProps={{
        conversations,
        activeConversationId: currentConversationId,
        onNewConversation: createNewConversation,
        onSelectConversation: setCurrentConversationId
      }}
    >
      <div className="flex-1 flex flex-col bg-gray-50 rounded-lg">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMessageList 
            messages={messages} 
            isLoading={isLoading} 
          />
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
