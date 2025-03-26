import { useState, useRef } from 'react';
import ConversationItem from "./ConversationItem";
import taskService from '../services/task'
import '../styles/ConversationDisplay.css';
import '../styles/ConversationItem.css';

const ConversationDisplay = ({ isLoading, setIsLoading, theme, isDisabled, messages = [], addMessage }) => {
  const [newComment, setNewComment] = useState("");
  const messagesRef = useRef(null);

  function parseQualitativeResponse(input) {
    // Initialize variables to store the parsed parts
    let analysis = "";
    let suggestions = "";

    // Extract analysis section
    const analysisMatch = input.match(/\[ANALYSIS\]([\s\S]*?)\[\/ANALYSIS\]/);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
    }

    // Extract suggestions section
    const suggestionsMatch = input.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].trim();
    }

    return { analysis, suggestions };
  }

  function checkAndAddMessage(sender, text, type) {
    if (!text) {
      console.log("no message");
      return;
    }
    addMessage({ sender: sender, text: text, type: "dialogue"}); 
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newComment.trim()) {
      return;
    }
    setIsLoading(true);
    checkAndAddMessage("user", newComment, "dialogue");   

    taskService
        .submitUserInput({
          inputData: {
            text: newComment,
            history: messages  // Add conversation history
          },
          text: newComment,
          objective: theme  // Add theme/objective if needed
        })
        .then((returnedResponse) => {
          if (returnedResponse && returnedResponse.text) {
            const parsed = parseQualitativeResponse(returnedResponse.text);
            const formattedResponse = `Analysis:\n${parsed.analysis}\n\nSuggestions:\n${parsed.suggestions}`;
            checkAndAddMessage("ai", formattedResponse, "dialogue");
          } else {
            console.error("Invalid response format:", returnedResponse);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    setNewComment("");
  };

  return (
    <div className="chat-space-wrapper">
      <h2>Qualitative Data Validation</h2>
      <div className="chat-space">
        <div className="messages" ref={messagesRef}>
          {messages?.filter(msg => msg.text !== "" && msg.text !== null)
            .map((msg, index) => (
              <ConversationItem key={index} message={msg} /> 
            ))
          }
        </div>
        {isLoading && <div>Analyzing data...</div>} 
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea 
              value={newComment}
              disabled={!isDisabled || isLoading}
              onChange={(event) => setNewComment(event.target.value)} 
              placeholder="Paste your qualitative data here for analysis"
              rows={4}
              className="input-textarea"
            />
            <button type="submit" 
              disabled={!isDisabled || isLoading}
              onClick={handleSubmit}> 
              Analyze
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConversationDisplay;
