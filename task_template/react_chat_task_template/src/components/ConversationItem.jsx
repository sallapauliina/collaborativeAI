import React from 'react';

const ConversationItem = ({ message }) => {
  const { sender, text } = message;

  // Function to format the text with line breaks
  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        {formatText(text)}
      </div>
    </div>
  );
};

export default ConversationItem; 