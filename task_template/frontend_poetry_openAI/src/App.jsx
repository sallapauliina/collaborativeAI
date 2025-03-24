import { useState } from 'react';
import ConversationDisplay from "./components/ConversationDisplay";
import Dialogue from "./components/Dialogue";
import TaskDescription from "./components/TaskDescription";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackForm from "./components/FeedbackForm";
import TutorialPopUp from './components/TutorialPopUp';
import ThemeForm from './components/ThemeForm';
import "./index.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isFinishClicked, setIsFinishClicked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message) => {
    setMessages(prevMessages => prevMessages.concat(message));
  };

  const toggleFinish = () => {
    setIsFinished(!isFinished);
  };

  const toggleFinishButton = () => {
    toggleFinish();
    setIsFinishClicked(!isFinishClicked);
  }

  return (
    <>
      <Header />
      <TaskDescription />
      <TutorialPopUp />
      <ThemeForm theme={theme} setTheme={setTheme} isDisabled={isDisabled} setIsDisabled={setIsDisabled} setIsLoading={setIsLoading} addMessage={addMessage}/>
      <div className="main-interaction">
        <Dialogue isLoading={isLoading} setIsLoading={setIsLoading} theme={theme} isDisabled={isDisabled} messages={messages} setMessages={setMessages} addMessage={addMessage} />
        <ConversationDisplay isLoading={isLoading} setIsLoading={setIsLoading} theme={theme} isDisabled={isDisabled} messages={messages} addMessage={addMessage} />
      </div>
      <div className="finish-btn-wrapper">
        <button type="submit" className="finish-btn" 
          disabled={messages.length <= 0}
          style={{
            "backgroundColor": isFinishClicked ? "#f44336" : "#6eb4ff",
            "cursor": isFinishClicked || messages.length <= 0 ? "not-allowed" : "pointer"
          }}
          onClick={toggleFinishButton}> 
          {isFinishClicked ? "Cancel" : "Finish"}
        </button>
      </div>
      {isFinished && <FeedbackForm />}
      <Footer />
    </>
  );
};

export default App;
