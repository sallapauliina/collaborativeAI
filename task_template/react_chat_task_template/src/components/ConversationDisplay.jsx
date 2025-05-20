import { useState, useRef } from 'react';
import ConversationItem from "./ConversationItem";
import taskService from '../services/task'
import '../styles/ConversationDisplay.css';
import '../styles/ConversationItem.css';

const ConversationDisplay = ({ isLoading, setIsLoading, theme, isDisabled, messages = [], addMessage }) => {
  const [inputData, setInputData] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState({
    inconsistencies: [],
    bias: [],
    suggestions: []
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showData, setShowData] = useState(false);
  const [agreedChanges, setAgreedChanges] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesRef = useRef(null);

  function parseStructuredItem(text) {
    const items = [];
    // More flexible regex that matches numbered items
    const regex = /(\d+)\.\s*(?:\[Title:\s*([^\]]+)\]|([^\n]+))([\s\S]*?)(?=(?:\d+\.|$))/g;
    let match;
    
    while ((match = regex.exec(text))) {
      const [_, number, title1, title2, details] = match;
      const detailsObj = {};
      
      // Parse details sections with more flexible matching
      const sections = ['Description:', 'Location:', 'Impact:', 'Type:', 'Addresses:'];
      sections.forEach(section => {
        const sectionRegex = new RegExp(`${section}\\s*([^\\n]*(?:\\n(?!${sections.join('|')}|\\d+\\.).*)*)`);
        const sectionMatch = details.match(sectionRegex);
        if (sectionMatch) {
          detailsObj[section.replace(':', '')] = sectionMatch[1].trim();
        }
      });

      items.push({
        id: `${number}-${(title1 || title2).trim()}`,
        number: parseInt(number),
        title: (title1 || title2).trim(),
        ...detailsObj
      });
    }
    
    console.log('Parsed items:', items); // Add this for debugging
    return items;
  }

  function parseQualitativeResponse(input) {
    console.log('Raw AI response:', input); // Add this for debugging
    
    let analysis = {
      inconsistencies: [],
      bias: [],
      suggestions: []
    };

    const analysisMatch = input.match(/\[ANALYSIS\]([\s\S]*?)\[\/ANALYSIS\]/);
    if (analysisMatch) {
      const inconsistenciesMatch = analysisMatch[1].match(/\[INCONSISTENCIES\]([\s\S]*?)\[\/INCONSISTENCIES\]/);
      if (inconsistenciesMatch) {
        analysis.inconsistencies = parseStructuredItem(inconsistenciesMatch[1].trim());
      }

      const biasMatch = analysisMatch[1].match(/\[BIAS\]([\s\S]*?)\[\/BIAS\]/);
      if (biasMatch) {
        analysis.bias = parseStructuredItem(biasMatch[1].trim());
      }
    }

    const suggestionsMatch = input.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
    if (suggestionsMatch) {
      analysis.suggestions = parseStructuredItem(suggestionsMatch[1].trim());
    }

    console.log('Parsed analysis:', analysis); // Add this for debugging
    return analysis;
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
            const analysis = parseQualitativeResponse(returnedResponse.text);
            setCurrentAnalysis(analysis);
            
            // Add AI's analysis to message history with structured format
            const analysisText = [
              'Analysis:',
              analysis.inconsistencies.length > 0 ? `\nInconsistencies:\n${JSON.stringify(analysis.inconsistencies)}` : '',
              analysis.bias.length > 0 ? `\nPotential Bias:\n${JSON.stringify(analysis.bias)}` : '',
              analysis.suggestions.length > 0 ? `\nSuggestions:\n${JSON.stringify(analysis.suggestions)}` : ''
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
    setCurrentAnalysis({ inconsistencies: [], bias: [], suggestions: [] });
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
    addMessage({
      sender: 'user',
      text: `Feedback on analysis:\n${feedback}`,
      type: 'feedback'
    });

    taskService
      .submitUserInput({
        inputData: {
          text: feedback,
          originalData: inputData,
          currentAnalysis: currentAnalysis,
          type: "feedback"
        },
        text: feedback,
        objective: theme
      })
      .then((returnedResponse) => {
        if (returnedResponse?.text) {
          const analysis = parseQualitativeResponse(returnedResponse.text);
          setCurrentAnalysis(analysis); // Update the analysis with new findings
          
          // Add AI's response to message history
          const analysisText = [
            'Updated Analysis based on feedback:',
            analysis.inconsistencies.length > 0 ? `\nInconsistencies:\n${JSON.stringify(analysis.inconsistencies)}` : '',
            analysis.bias.length > 0 ? `\nPotential Bias:\n${JSON.stringify(analysis.bias)}` : '',
            analysis.suggestions.length > 0 ? `\nResponse to feedback:\n${JSON.stringify(analysis.suggestions)}` : ''
          ].filter(Boolean).join('\n');
          
          addMessage({
            sender: 'ai',
            text: analysisText,
            type: 'feedback-response'
          });

          // Clear feedback field after submission
          setFeedback('');
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

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestions(prev => {
      const exists = prev.some(s => s.id === suggestion.id);
      if (exists) {
        return prev.filter(s => s.id !== suggestion.id);
      }
      return [...prev, suggestion];
    });
  };

  const handleExportSelected = () => {
    const exportData = selectedSuggestions.map(suggestion => ({
      title: suggestion.title,
      description: suggestion.Description,
      addresses: suggestion.Addresses
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-suggestions.json';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <section className="feedback-section">
          <h3>Refine Analysis</h3>
          <div className="form-wrapper">
            <form onSubmit={handleFeedback} className="input-form">
              <textarea 
                value={feedback}
                disabled={!isDisabled || isLoading}
                onChange={(e) => setFeedback(e.target.value)} 
                placeholder="Provide suggestions to refine the analysis. For example:
• Point out aspects that might need more attention
• Suggest different perspectives to consider
• Ask for clarification on specific points"
                className="feedback-textarea"
              />
              <button 
                type="submit" 
                disabled={!isDisabled || isLoading}
                className={`feedback-button ${isLoading ? 'loading' : ''}`}
              > 
                {isLoading ? 'Refining Analysis...' : 'Refine Analysis'}
              </button>
            </form>
          </div>
        </section>
          <div className="analysis-feedback-container">
            <section className="analysis-section">
              <h3>Current Analysis</h3>
              <div className="analysis-content">
                {currentAnalysis.inconsistencies.length > 0 || currentAnalysis.bias.length > 0 || currentAnalysis.suggestions.length > 0 ? (
                  <div className="analysis-sections">
                    {currentAnalysis.inconsistencies.length > 0 && (
                      <div className="analysis-category">
                        <h4>Inconsistency-Related Suggestions</h4>
                        {currentAnalysis.inconsistencies.map(item => (
                          <div key={item.id} className="analysis-item">
                            <div className="analysis-item-header">
                              <h5>{item.title}</h5>
                              <button
                                onClick={() => handleSuggestionSelect(item)}
                                className={`suggestion-select-button ${
                                  selectedSuggestions.some(s => s.id === item.id) ? 'selected' : ''
                                }`}
                              >
                                {selectedSuggestions.some(s => s.id === item.id) ? '✓' : '+'}
                              </button>
                            </div>
                            <div className="analysis-item-content">
                              <p><strong>Description:</strong> {item.Description}</p>
                              <p><strong>Addresses:</strong> {item.Addresses}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentAnalysis.bias.length > 0 && (
                      <div className="analysis-category">
                        <h4>Bias-Related Suggestions</h4>
                        {currentAnalysis.bias.map(item => (
                          <div key={item.id} className="analysis-item">
                            <div className="analysis-item-header">
                              <h5>{item.title}</h5>
                              <button
                                onClick={() => handleSuggestionSelect(item)}
                                className={`suggestion-select-button ${
                                  selectedSuggestions.some(s => s.id === item.id) ? 'selected' : ''
                                }`}
                              >
                                {selectedSuggestions.some(s => s.id === item.id) ? '✓' : '+'}
                              </button>
                            </div>
                            <div className="analysis-item-content">
                              <p><strong>Description:</strong> {item.Description}</p>
                              <p><strong>Addresses:</strong> {item.Addresses}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentAnalysis.suggestions.length > 0 && (
                      <div className="analysis-category">
                        <h4>General Improvement Suggestions</h4>
                        {currentAnalysis.suggestions.map(item => (
                          <div key={item.id} className="analysis-item">
                            <div className="analysis-item-header">
                              <h5>{item.title}</h5>
                              <button
                                onClick={() => handleSuggestionSelect(item)}
                                className={`suggestion-select-button ${
                                  selectedSuggestions.some(s => s.id === item.id) ? 'selected' : ''
                                }`}
                              >
                                {selectedSuggestions.some(s => s.id === item.id) ? '✓' : '+'}
                              </button>
                            </div>
                            <div className="analysis-item-content">
                              <p><strong>Description:</strong> {item.Description}</p>
                              <p><strong>Addresses:</strong> {item.Addresses}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-analysis">
                    {isLoading ? 
                      "" : 
                      (inputData ? 
                        "No issues found in the data." : 
                        "No analysis yet. Submit data to begin.")}
                  </p>
                )}
              </div>
              {isLoading && <div className="loading">Analyzing data...</div>}
            </section>
            <section  className="analysis-section">
            <h3>Selected Suggestions</h3>
           { selectedSuggestions.length > 0 && (
            <>
              <div className="selected-suggestions-list">
                {selectedSuggestions.map(item => (
                  <div key={item.id} className="analysis-item">
                    <div className="analysis-item-header">
                      <h5>{item.title}</h5>
                      <button
                        onClick={() => handleSuggestionSelect(item)}
                        className="remove-suggestion"
                      >
                        ×
                      </button>
                    </div>
                    <div className="analysis-item-content">
                      <p><strong>Description:</strong> {item.Description}</p>
                      <p><strong>Addresses:</strong> {item.Addresses}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedSuggestions.length > 0 && (
                <button 
                  onClick={handleExportSelected}
                  className="export-button"
                >
                  Export Selected Suggestions
                </button>
              )}
            </>
          )}
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
              onClick={() => setShowHistory(true)}
              className="view-history-button"
            >
              View Message History
            </button>
            <button 
              onClick={handleExport}
              className="export-button"
            >
              Export Full History
            </button>
          </div>

          {/* Message History Modal */}
          {showHistory && (
            <div className="data-modal">
              <div className="data-modal-content">
                <div className="data-modal-header">
                  <h4>Message History</h4>
                  <button 
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="close-button"
                  >
                    ×
                  </button>
                </div>
                <div className="data-modal-body">
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
            </div>
          )}
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
