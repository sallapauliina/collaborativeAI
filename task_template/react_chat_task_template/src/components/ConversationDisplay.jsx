import { useState, useRef } from 'react';
import ConversationItem from "./ConversationItem";
import taskService from '../services/task'
import '../styles/ConversationDisplay.css';
import '../styles/ConversationItem.css';

const ConversationDisplay = ({ isLoading, setIsLoading, theme, isDisabled, messages = [], addMessage }) => {
  const [inputData, setInputData] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState({
    inconsistencies: "",
    bias: ""
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showData, setShowData] = useState(false);
  const [agreedChanges, setAgreedChanges] = useState([]);
  const messagesRef = useRef(null);

  function parseQualitativeResponse(input) {
    let analysis = {
      inconsistencies: "",
      bias: ""
    };
    let suggestions = "";

    // Extract analysis sections
    const analysisMatch = input.match(/\[ANALYSIS\]([\s\S]*?)\[\/ANALYSIS\]/);
    if (analysisMatch) {
      const analysisContent = analysisMatch[1];
      
      // Parse inconsistencies
      const inconsistenciesMatch = analysisContent.match(/\[INCONSISTENCIES\]([\s\S]*?)\[\/INCONSISTENCIES\]/);
      if (inconsistenciesMatch) {
        analysis.inconsistencies = inconsistenciesMatch[1].trim();
      }

      // Parse bias
      const biasMatch = analysisContent.match(/\[BIAS\]([\s\S]*?)\[\/BIAS\]/);
      if (biasMatch) {
        analysis.bias = biasMatch[1].trim();
      }
    }

    // Extract suggestions
    const suggestionsMatch = input.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].trim();
    }

    return { analysis, suggestions };
  }

  const handleAnalyze = (event) => {
    event.preventDefault();
    if (!inputData.trim()) return;
    
    setIsLoading(true);
    setShowAnalysis(true);  // Show analysis view immediately
    
    addMessage({
      sender: 'user',
      text: `Submitted data for analysis:\n${inputData}`,
      type: 'data'
    });

    taskService
        .submitUserInput({
          inputData: {
            text: inputData,
            type: "analyze"
          },
          text: inputData,
          objective: theme
        })
        .then((returnedResponse) => {
          if (returnedResponse?.text) {
            const parsed = parseQualitativeResponse(returnedResponse.text);
            setCurrentAnalysis(parsed.analysis);
            // Add AI's analysis to message history with structured format
            const analysisText = [
              'Analysis:',
              parsed.analysis.inconsistencies ? `\nInconsistencies:\n${parsed.analysis.inconsistencies}` : '',
              parsed.analysis.bias ? `\nPotential Bias:\n${parsed.analysis.bias}` : '',
              parsed.suggestions ? `\nSuggestions:\n${parsed.suggestions}` : ''
            ].filter(Boolean).join('\n');
            
            addMessage({
              sender: 'ai',
              text: analysisText,
              type: 'analysis'
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
  };

  const handleStartOver = () => {
    setInputData("");
    setFeedback("");
    setCurrentAnalysis({ inconsistencies: "", bias: "" });
    setShowAnalysis(false);
  };

  const handleExport = () => {
    // Create message history export
    const exportData = messages.map(msg => ({
      timestamp: new Date().toISOString(),
      sender: msg.sender,
      content: msg.text
    }));

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-history.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFeedback = (event) => {
    event.preventDefault();
    if (!feedback.trim()) return;

    setIsLoading(true);
    // Add user's feedback to message history
    addMessage({
      sender: 'user',
      text: `Feedback on analysis:\n${feedback}`,
      type: 'feedback'
    });

    taskService
        .submitUserInput({
          inputData: {
            text: feedback,
            currentAnalysis,
            originalData: inputData,
            type: "feedback"
          },
          text: feedback,
          objective: theme
        })
        .then((returnedResponse) => {
          if (returnedResponse?.text) {
            const parsed = parseQualitativeResponse(returnedResponse.text);
            setCurrentAnalysis(parsed.analysis);
            
            // Add AI's response to message history with structured format
            const responseText = [
              'Response to feedback:',
              parsed.suggestions ? `\n${parsed.suggestions}` : '',
              '\nUpdated Analysis:',
              parsed.analysis.inconsistencies ? `\nInconsistencies:\n${parsed.analysis.inconsistencies}` : '',
              parsed.analysis.bias ? `\nPotential Bias:\n${parsed.analysis.bias}` : ''
            ].filter(Boolean).join('\n');
            
            addMessage({
              sender: 'ai',
              text: responseText,
              type: 'feedback-response'
            });
            
            // Add agreed change to audit trail if AI confirms
            if (parsed.suggestions.toLowerCase().includes('agree')) {
              setAgreedChanges(prev => [...prev, {
                timestamp: new Date().toISOString(),
                feedback,
                response: parsed.suggestions,
                change: responseText
              }]);
            }
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="validation-workspace">
      {!showAnalysis ? (
        // Input Data Section
        <section className="data-input-section">
          <h3>Input Qualitative Data</h3>
          <div className="form-wrapper">
            <form onSubmit={handleAnalyze} className="input-form">
              <div className="file-input-wrapper">
                <div className="file-input-row">
                  <input 
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    disabled={!isDisabled || isLoading}
                    className="file-input"
                  />
                  {inputData && (
                    <button
                      type="button"
                      onClick={() => setShowData(!showData)}
                      className="view-data-button"
                    >
                      {showData ? 'Hide Data' : 'View Data'}
                    </button>
                  )}
                </div>
                {showData && inputData && (
                  <div className="data-modal">
                    <div className="data-modal-content">
                      <div className="data-modal-header">
                        <h4>Your Data</h4>
                        <button 
                          type="button"
                          onClick={() => setShowData(false)}
                          className="close-button"
                        >
                          ×
                        </button>
                      </div>
                      <div className="data-modal-body">
                        <div className="dialogue-item user">
                          <div className="dialogue-text">
                            {inputData.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={!isDisabled || isLoading || !inputData}
                className="analyze-button"
              > 
                Analyze Data
              </button>
            </form>
          </div>
        </section>
      ) : (
        // Analysis and Feedback Sections
        <>
          <div className="analysis-feedback-container">
            <section className="analysis-section">
              <h3>Current Analysis</h3>
              <div className="analysis-content">
                {(currentAnalysis.inconsistencies || currentAnalysis.bias) ? (
                  <div className="analysis-sections">
                    {currentAnalysis.inconsistencies && (
                      <div className="analysis-category">
                        <h4>Inconsistencies Found</h4>
                        <div className="dialogue-item ai">
                          <div className="dialogue-text">
                            {currentAnalysis.inconsistencies.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentAnalysis.bias && (
                      <div className="analysis-category">
                        <h4>Potential Bias Identified</h4>
                        <div className="dialogue-item ai">
                          <div className="dialogue-text">
                            {currentAnalysis.bias.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-analysis">
                    {inputData ? 
                      "No inconsistencies or bias found in the data." : 
                      "No analysis yet. Submit data to begin."}
                  </p>
                )}
              </div>
              {isLoading && <div className="loading">Analyzing data...</div>}
            </section>

            <section className="feedback-section">
              <h3>Provide Feedback</h3>
              <div className="dialogue-content">
                {feedback && (
                  <div className="dialogue-item user">
                    <div className="dialogue-text">
                      {feedback.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-wrapper">
                <form onSubmit={handleFeedback} className="input-form">
                  <textarea 
                    value={feedback}
                    disabled={!isDisabled || isLoading || !(currentAnalysis.inconsistencies || currentAnalysis.bias)}
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder={currentAnalysis.inconsistencies || currentAnalysis.bias ? 
                      "Provide feedback on the analysis..." : 
                      "Submit data for analysis first"}
                    rows={4}
                    className="feedback-textarea"
                  />
                  <button 
                    type="submit" 
                    disabled={!isDisabled || isLoading || !(currentAnalysis.inconsistencies || currentAnalysis.bias)}
                    className="feedback-button"
                  > 
                    Submit Feedback
                  </button>
                </form>
              </div>
            </section>
          </div>

          <div className="data-view-section">
            {showData && inputData && (
              <div className="data-modal">
                <div className="data-modal-content">
                  <div className="data-modal-header">
                    <h4>Your Data</h4>
                    <button 
                      type="button"
                      onClick={() => setShowData(false)}
                      className="close-button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="data-modal-body">
                    <div className="dialogue-item user">
                      <div className="dialogue-text">
                        {inputData.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="workflow-buttons">
            <button 
              onClick={handleStartOver}
              className="start-over-button"
            >
              Start Over
            </button>
            <button 
              onClick={handleExport}
              className="export-button"
            >
              Export History
            </button>
          </div>
        </>
      )}

      {/* Audit Trail */}
      <section className="audit-trail">
        <h3>Audit trail</h3>
        <div className="audit-list">
          {agreedChanges.map((entry, index) => (
            <div key={index} className="audit-entry">
              <div className="audit-timestamp">{new Date(entry.timestamp).toLocaleString()}</div>
              <div className="audit-content">
                <div className="feedback-detail">
                  <strong>Feedback:</strong>
                  <p>{entry.feedback}</p>
                </div>
                <div className="response-detail">
                  <strong>AI Response:</strong>
                  <p>{entry.response}</p>
                </div>
                <div className="change-detail">
                  <strong>Agreed Change:</strong>
                  <p>{entry.change}</p>
                </div>
              </div>
            </div>
          ))}
          {agreedChanges.length === 0 && (
            <p className="no-changes">No agreed changes yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConversationDisplay;
