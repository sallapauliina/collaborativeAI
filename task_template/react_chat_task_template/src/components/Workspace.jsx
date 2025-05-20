import { useState } from 'react';
import ConversationDisplay from './ConversationDisplay';
import '../styles/Workspace.css';

const Workspace = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div className="workspace-container">
      <div className="main-content">
        <ConversationDisplay 
          messages={messages}
          addMessage={addMessage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isDisabled={isDisabled}
        />
      </div>

    </div>
  );
};

export default Workspace;
