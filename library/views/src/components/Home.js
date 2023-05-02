import { Link, useOutletContext } from "react-router-dom";
import Icon from "./../images/icon.jpg";
import jwtDecode from 'jwt-decode';

const Home = () => {
  const { jwtToken } = useOutletContext();
  const decodedToken = jwtDecode(jwtToken);

  return (
    <>
      <div className="text-center">
        <h2>Hi {decodedToken.name}, find a new book for yourself!</h2>
        <hr />
        <Link to="/books">
          <img src={Icon} alt="icon"></img>
        </Link>
      </div>
    </>
  );
};

export default Home;