const DialogueItem = ({ message, style }) => {
  const messageClass = message.sender === "user" ? "user-dialogue" : "ai-dialogue";

  const parsedJSON = JSON.parse(message.text)

  return (
    <>
      <div className={`dialogue-poem ${messageClass}`}>
          {Object.entries(parsedJSON).map(([day, meals]) => (
            <div key={day}>
              <h3>{day}:</h3>
              <ul>
                <li><b>Breakfast: </b>{meals.Breakfast}.</li>
                <li><b>Lunch: </b>: {meals.Lunch}.</li>
                <li><b>Dinner: </b>: {meals.Dinner}.</li>
              </ul>
              <br></br>
            </div>
          ))}
      </div>
    </>
  );
};

export default DialogueItem;
