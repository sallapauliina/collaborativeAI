import { useState, useEffect, useRef } from 'react';
import DialogueItem from "./DialogueItem";
import { dialogueType } from "../utils/config";
import taskService from '../services/task'
import { lengthLimit } from '../utils/config';

const Dialogue = ({ isLoading, setIsLoading, theme, isDisabled, messages, setMessages, addMessage }) => {
  const [newLine, setNewLine] = useState("");
  const [isLengthReached, setIsLengthReached] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    setIsLengthReached(messages.filter(msg => msg.text !== "" && msg.text !== null).length === lengthLimit)
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }    
  }, [messages])

  let style = "none";
  if (dialogueType === "paragraph") {
    style = "dialogue-paragraph";
  } else {
    style = "dialogue-poem";
  }

  const handleEditMessage = (index, newMessage) => {
    if (!newMessage.trim()) {
      alert("Please save a non empty dialogue");
    } else {
      setMessages(messages.map((message, idx) => idx !== index ? message : { ...message, text: newMessage }))
    }
  };

  function parsePoetryAndComment(input) {
    // Initialize variables to store the parsed parts
    let poetryLine = "";
    let comment = "";

    // Trim the input to remove leading/trailing whitespace
    input = input.trim();

    // Check if the input starts with a '[' character
    if (input.startsWith('[')) {
        // Find the closing ']' character
        let endBracketIndex = input.indexOf(']');
        
        // If a closing ']' is found, extract the poetry line
        if (endBracketIndex !== -1) {
            poetryLine = input.substring(1, endBracketIndex).trim();
            // Extract the comment part if there is any text after the closing ']'
            if (endBracketIndex + 1 < input.length) {
                comment = input.substring(endBracketIndex + 1).trim();
            }
        }
    } else {
        // If the input doesn't start with '[', consider the whole input as a comment
        comment = input;
    }

    // console.log("Parsed: ", poetryLine, ", ", comment)

    return { poetryLine, comment };
  }

  function checkAndAddMessage(sender, text, comment, type) {
    text = (typeof text === 'string' && text.trim()) ? text : null;
    comment = (typeof comment === 'string' && comment.trim()) ? comment : null;

    if (text === null && comment === null) {
      console.log("no message");
    } else {
      addMessage({ sender: sender, text: text, comment: comment, type: "dialogue"}); 
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newLine.trim()) {
      return;
    }
    setIsLoading(true);
    checkAndAddMessage("user", newLine, null,"dialogue");
    
    if (messages.filter(msg => msg.text !== "" && msg.text !== null).length < lengthLimit - 1) {
      taskService
          .submitUserInput({
            inputData: { 
              comment: false,
              poem: messages
            }, 
            text: newLine, 
            ojective: theme
          })
          .then((returnedResponse) => {
            let parsed = parsePoetryAndComment(returnedResponse.text)
            checkAndAddMessage("ai", parsed.poetryLine, parsed.comment,"dialogue")
            setIsLoading(false)
          })
          .catch((error) => {
            console.log(error)
          });
      setNewLine("");
    }
  };

  return (
    <div className="dialogue-wrapper">
      <h2>Your joint poem</h2>
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
                handleEditMessage={handleEditMessage}
                style={style}
              />
            ))}
        </div>
        {isLoading && <div>Waiting for response...</div>} 
        {isLengthReached && 
        <span 
          style={{
            "color" : "#FF0000"
          }}>
          Thank you. Here is our final poem. Please click "Rate task" to rate it!
        </span>
        }
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="input-form">
            <input 
              value={newLine}
              disabled={isLengthReached || !isDisabled || isLoading}
              onChange={(event) => setNewLine(event.target.value)}
              placeholder="Add a line to the poem" 
            />
            <button type="submit" 
              disabled={isLengthReached || !isDisabled || isLoading}
              onClick={handleSubmit}> 
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
