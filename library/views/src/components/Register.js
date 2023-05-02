import { useState } from "react";
import Input from "./form/Input";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // build the request payload
    const payload = {
      first_name: firstName,
      last_name: lastName,
      password: password,
      email: email,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch("/register", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // handle success or error response from server
        if (data.error) {
          setErrorMessage(data.message);
        } else {
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        console.error(error);
        // handle error response
        setErrorMessage("An error occurred while registering. Please try again.");
      });
  };

  return (
    <div className="col-md-6 offset-md-3">
      <h2>Register</h2>
      <hr />

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          title="First Name"
          type="text"
          className="form-control"
          name="firstName"
          autoComplete="given-name"
          onChange={(event) => setFirstName(event.target.value)}
        />

        <Input
          title="Last Name"
          type="text"
          className="form-control"
          name="lastName"
          autoComplete="family-name"
          onChange={(event) => setLastName(event.target.value)}
        />

        <Input
          title="Email Address"
          type="email"
          className="form-control"
          name="email"
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          title="Password"
          type="password"
          className="form-control"
          name="password"
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />

        <hr />

        <input
          type="submit"
          className="btn btn-primary"
          value="Register"
        />
      </form>
    </div>
  );
};

export default Register;
