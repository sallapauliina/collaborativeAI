const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="acknowledge-section">
        <h2>Acknowledgement</h2>
        <br></br>
        <p>
          This work was funded by the European Union Horizon 2020 
          Research and Innovation Programme as part of the Humane-AI-net 
          project, under grant agreement number 952026. 
        </p> <br></br>
        <p>
          <strong>Humane-AI Net: </strong><a href="https://www.humane-ai.eu/" target="_blank">https://www.humane-ai.eu/</a>
        </p> <br></br>
        <p>
          <strong>AI Builder: </strong><a href="https://www.ai4europe.eu/ai-builder" target="_blank">https://www.ai4europe.eu/ai-builder</a>
        </p>
      </div>
      <div className="logo-section">
        <img src="./image1.png" alt="Project Logo" />
      </div>
    </footer>
  );
}

export default Footer;