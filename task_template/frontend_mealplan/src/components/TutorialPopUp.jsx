import { useState, useEffect } from "react";

const TutorialPopUp = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClosePopUpKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
  
    document.addEventListener("keydown", handleClosePopUpKey)
    return () => document.removeEventListener("keydown", handleClosePopUpKey)
  }, [])

  const togglePopUp = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <button className="open-tutorial-btn" onClick={togglePopUp}>Quick guide</button>

      {isOpen && (
        <div className="popup-wrapper">
          <div className="popup">
            <button className="close-popup-btn" onClick={togglePopUp}>x</button>
            <h2>Poetry task quick guide</h2>
            <div className="image-grid-container">
              <div className="image-container">
                <img src="./topic.png" alt="Main UI" className="image" />
                <div className="description">
                  <p>
                    Provide a theme for the poem. 
                  </p>
                </div>
              </div>

              <div className="image-container">
                <img src="./start.png" alt="Choose your topic" className="image" />
                <div className="description">
                  <p>
                    The AI then writes the first line.
                  </p>
                  <p>
                    Then it is your turn to write.
                  </p>
                </div>
              </div>

              <div className="image-container">
                <img src="./discussion.png" alt="Communicate with the AI model" className="image" />
                <div className="description">
                  <p>
                    If you want to discuss with the AI, you can do that in the Dialogue box. 
                  </p>
                </div>
              </div>

              <div className="image-container">
                <img src="./finish.png" alt="Send rating" className="image" />
                <div className="description">
                  <p>
                    Please then rate your experience with the AI. 
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialPopUp;
