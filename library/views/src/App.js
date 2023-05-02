import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Alert from "./components/Alert";
import jwt_decode from 'jwt-decode';
import Home from "./components/Home";

function App() {
  const [jwtToken, setJwtToken] = useState("");
  const [userID, setUserID] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertClassName, setAlertClassName] = useState("d-none");

  const [tickInterval, setTickInterval] = useState();

  const navigate = useNavigate();

  const logOut = () => {
    const requestOptions = {
      method: "GET",
      credentials: "include",
    }

    fetch(`/logout`, requestOptions)
    .catch(error => {
      console.log("error logging out", error);
    })
    .finally(() => {
      setJwtToken("");
      setUserID("");
      <Home jwtToken={jwtToken} />
      toggleRefresh(false);
    })
    navigate("/login");
    localStorage.setItem("email", "");
  }

  const toggleRefresh = useCallback((status) => {
    console.log("clicked");

    if (status) {
      console.log("turning on ticking");
      let i  = setInterval(() => {

        const requestOptions = {
          method: "GET",
          credentials: "include",
        }

        fetch(`/refresh`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            setJwtToken(data.access_token);
            var decoded = jwt_decode(data.access_token);
            setUserID(decoded.sub);
            <Home jwtToken={jwtToken} />
          }
        })
        .catch(error => {
          console.log("user is not logged in");
        })
      }, 600000);
      setTickInterval(i);
      console.log("setting tick interval to", i);
    } else {
      console.log("turning off ticking");
      console.log("turning off tickInterval", tickInterval);
      setTickInterval(null);
      clearInterval(tickInterval); 
    }
  }, [jwtToken, tickInterval])

  useEffect(() => {
    if (jwtToken === "") {
      const requestOptions = {
        method: "GET",
        credentials: "include",
      }
  
      fetch(`/refresh`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            setJwtToken(data.access_token);
            <Home jwtToken={jwtToken} />
            var decoded = jwt_decode(data.access_token);
            setUserID(decoded.sub);
            toggleRefresh(true);
          }
        })
        .catch(error => {
          console.log("user is not logged in", error);
        })
    } else {
      var decoded = jwt_decode(jwtToken);
      setUserID(decoded.sub);
    }
  }, [jwtToken, toggleRefresh])
  
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1 className="mt-3">BookStore</h1>
        </div>
        <div className="col text-end">
          {jwtToken === "" ? (
            <Link to="/login">
              <span className="badge bg-success">Login</span>
            </Link>
          ) : (
            <a href="#!" onClick={logOut}>
              <span className="badge bg-danger">Logout</span>
            </a>
          )}
        </div>
        <hr className="mb-3"></hr>
      </div>

      <div className="row">
        <div className="col-md-2">
          <nav>
            <div className="list-group">
              {jwtToken !== "" && (
              <>
              <Link to="/" className="list-group-item list-group-item-action">
                Home
              </Link>
              <Link
                to="/books"
                className="list-group-item list-group-item-action"
              >
                Books
              </Link>
              <Link
                to="/genres"
                className="list-group-item list-group-item-action"
              >
                Genres
              </Link>
              <Link
                    to="/graphql"
                    className="list-group-item list-group-item-action"
                  >
                  GraphQL
              </Link>
              </>
              )}
              {jwtToken !== "" && userID === "1" && (
                <>
                  <Link
                    to="/admin/book/0"
                    className="list-group-item list-group-item-action"
                  >
                    Add Book
                  </Link>
                  <Link
                    to="/manage-catalogue"
                    className="list-group-item list-group-item-action"
                  >
                    Manage Catalogue
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
        <div className="col-md-10">
          <Alert message={alertMessage} className={alertClassName} />
          <Outlet
            context={{
              jwtToken,
              setJwtToken,
              setUserID,
              setAlertClassName,
              setAlertMessage,
              toggleRefresh,
            }}
          >
            {/* <Home jwtToken={jwtToken} /> */}
          </Outlet>

        </div>
      </div>
    </div>
  );
}

export default App;
