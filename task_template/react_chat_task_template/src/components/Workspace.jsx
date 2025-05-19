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
      <div className="audit-trail-sidebar">
        <h3>Message History</h3>
        <div className="history-list">
          {messages.map((msg, index) => (
            <div key={index} className={`history-item ${msg.sender}`}>
              <div className="history-header">
                <span className="sender">{msg.sender === 'user' ? 'User' : 'AI'}</span>
                <span className="timestamp">{new Date().toLocaleString()}</span>
              </div>
              <div className="history-content">
                <div className="message-text">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="no-messages">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
