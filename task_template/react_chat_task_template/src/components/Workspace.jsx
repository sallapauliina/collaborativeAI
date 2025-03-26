import { useState } from 'react';
import ConversationDisplay from './ConversationDisplay';
import FeedbackForm from './FeedbackForm';
import FinishButton from './FinishButton';

const Workspace = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div className="workspace">
      <ConversationDisplay 
        messages={messages}
        addMessage={addMessage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        isDisabled={isDisabled}
      />
      <FinishButton 
        isDisabled={!isDisabled}
        setIsDisabled={setIsDisabled}
      />
      <FeedbackForm />
    </div>
  );
};

export default Workspace;
