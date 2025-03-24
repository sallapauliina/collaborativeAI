import { useEffect, useRef } from 'react';
import DialogueItem from "./DialogueItem";

const Dialogue = ({ isLoading, messages }) => {
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }    
  }, [messages])

  return (
    <div className="dialogue-wrapper">
      <h2>Meal Plan</h2>
      <div className="dialogue">
        <div className="dialogue-content" ref={messagesRef}>
          {messages
            .map((msg, idx) => ({ ...msg, originalIndex: idx })) // Preserve original index
            .filter(msg => msg.text !== "" && msg.text !== null)
            .map((msg) => (
              <DialogueItem
                key={msg.originalIndex} // Use original index as key if needed
                idx={msg.originalIndex} // Pass original index as `idx`
                message={msg}
              />
            ))}
        </div>
        {isLoading && <div>Waiting for response...</div>} 
      </div>
    </div>
  );
};

export default Dialogue;
