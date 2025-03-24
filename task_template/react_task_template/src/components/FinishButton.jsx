
const FinishButton = ({ isFinishClicked,isRatingSubmitted, toggleFinish }) => {
  return (
    <div className="finish-btn-wrapper">
        <button type="submit" className="finish-btn"
          disabled={isRatingSubmitted}
          style={{
            "backgroundColor": isFinishClicked ? "#f44336" : "#6eb4ff",
            "cursor": isFinishClicked ? "not-allowed" : "pointer"
          }}
          onClick={toggleFinish}> 
          {isFinishClicked ? "Cancel" : "Finish"}
        </button>
    </div>
  );
}

export default FinishButton;