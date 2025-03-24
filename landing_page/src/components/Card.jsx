const Card = ({card}) => {

  const handleTaskClick = () => {
    window.open(card.task_link, "_blank");
  };

  const handleCodeClick = () => {
    window.open(card.code_link, "_blank");
  };

  return (
    <div className="card-container" onClick={handleTaskClick}>
      <img src={card.link} alt={card.name} className="card-img" title={card.image_credit}/>
      <h2 className="card-name">{card.name}</h2>
      <div className="card-description">
        <ul>
          {[... card.description].map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="card-btn-group">
        <div className="code-btn-wrapper">
          <a className="code-btn" onClick={handleCodeClick} style={{color: "rgb(176, 124, 124)"}} >
            <i className="fa fa-code"></i>
          </a>
          <p className="code-link-text">View code</p>
        </div>
      </div>
    </div>
  );
}

export default Card;