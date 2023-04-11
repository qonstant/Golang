import { Link } from "react-router-dom";
import Icon from "./../images/icon.jpg";

const Home = () => {
  return (
    <>
      <div className="text-center">
        <h2>Find a new book for youself!</h2>
        <hr />
        <Link to="/books">
          <img src={Icon} alt="icon"></img>
        </Link>
      </div>
    </>
  );
};

export default Home;
