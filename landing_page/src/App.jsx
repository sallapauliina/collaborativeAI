import Rules from "./components/TaskDescription";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";
import CardList from "./components/CardList";

const App = () => {
  return (
    <>
      <Header />
      <Rules />
      <CardList/>
      <Footer />
    </>
  );
};

export default App;
