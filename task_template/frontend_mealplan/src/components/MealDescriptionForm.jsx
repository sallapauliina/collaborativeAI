import taskService from '../services/task'

const MealDescriptionForm = ({ mealDescription, setMealDescription, messages, isDisabled, setIsDisabled, setIsLoading, addMessage }) => {
  function parsePoetryAndComment(input) {
    // Initialize variables to store the parsed parts
    let mealPlan = "";
    let comment = "";
  
    // Trim the input to remove leading/trailing whitespace
    input = input.trim();
  
    // Check if the input starts with a '[' character
    if (input.startsWith('[')) {
        // Find the closing ']' character
        let endBracketIndex = input.indexOf(']');
        
        // If a closing ']' is found, extract the poetry line
        if (endBracketIndex !== -1) {
            mealPlan = input.substring(1, endBracketIndex).trim();
            // Extract the comment part if there is any text after the closing ']'
            if (endBracketIndex + 1 < input.length) {
                comment = input.substring(endBracketIndex + 1).trim();
            }
        }
    } else {
        // If the input doesn't start with '[', consider the whole input as a comment
        comment = input;
    }
  
    // console.log("Parsed: ", mealPlan, ", ", comment)
  
    return { mealPlan, comment };
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

  const chooseMealDescription = (event) => {
    if (!mealDescription.trim()) {
      alert("Please enter the description of your preferred meal plan");
      return;
    }
    event.preventDefault();
    setIsDisabled(true);
    setIsLoading(true);

    taskService
      .submitUserInput({
        inputData: {
          comment: true,
          plans: []
        },
        text: "Give me a meal plan based on the description",
        objective: mealDescription
      })
      .then((returnedResponse) => {
        let parsed = parsePoetryAndComment(returnedResponse.text)
        checkAndAddMessage("ai", parsed.mealPlan, parsed.comment, "dialogue")
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error)
      });
  };

  return (
    <>
      <div className='meal-description-wrapper'>
        <form onSubmit={chooseMealDescription} className="meal-description-input">
          <h3 style={{"maxWidth": "200px"}}>Tell me your meal plan description </h3>
          <textarea 
            type="text"
            style={{"minWidth": "180px", "minHeight": "80px"}}
            disabled={isDisabled}
            placeholder="What kind of meal plan would you like to have?"
            value={mealDescription}
            onChange={(event) => setMealDescription(event.target.value)}
          />
          <button 
            type="button"
            disabled={isDisabled}
            className="meal-description-submit-btn"
            onClick={chooseMealDescription}>
            Submit 
          </button>
        </form>
      </div>
    </>
  );
};

export default MealDescriptionForm;
