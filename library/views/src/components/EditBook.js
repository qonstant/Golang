import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Input from "./form/Input";
import Select from "./form/Select";
import TextArea from "./form/TextArea";
import Checkbox from "./form/Checkbox";
import Swal from "sweetalert2";

const EditBook = () => {
  const navigate = useNavigate();
  const { jwtToken } = useOutletContext();

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);

  const Options = [
    { id: "1", value: "1" },
    { id: "2", value: "2" },
    { id: "3", value: "3" },
    { id: "4", value: "4" },
    { id: "5", value: "5" },
    { id: "6", value: "6" },
    { id: "7", value: "7" },
    { id: "8", value: "8" },
    { id: "9", value: "9" },
    { id: "10", value: "10" },
  ];

  const hasError = (key) => {
    return errors.indexOf(key) !== -1;
  };

  const [book, setBook] = useState({
    id: 0,
    title: "",
    release_date: "",
    pages: "",
    rating: "",
    description: "",
    genres: [],
    genres_array: [Array(14).fill(false)],
  });

  // get id from the URL
  let { id } = useParams();
  if (id === undefined) {
    id = 0;
  }

  useEffect(() => {
    if (jwtToken === "") {
      navigate("/login");
      return;
    }

    if (id === 0) {
      // adding a book
      setBook({
        id: 0,
        title: "",
        release_date: "",
        pages: "",
        rating: "",
        description: "",
        genres: [],
        genres_array: [Array(14).fill(false)],
      });

      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const requestOptions = {
        method: "GET",
        headers: headers,
      };

      fetch(`/genres`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          const checks = [];

          data.forEach((g) => {
            checks.push({ id: g.id, checked: false, genre: g.genre });
          });

          setBook((m) => ({
            ...m,
            genres: checks,
            genres_array: [],
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // editing an existing book
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", "Bearer " + jwtToken);

      const requestOptions = {
        method: "GET",
        headers: headers,
      };

      fetch(`/admin/books/${id}`, requestOptions)
        .then((response) => {
          if (response.status !== 200) {
            setError("Invalid response code: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          // fix release date
          data.book.release_date = new Date(data.book.release_date)
            .toISOString()
            .split("T")[0]; 

          const checks = [];

          data.genres.forEach((g) => {
            if (data.book.genres_array.indexOf(g.id) !== -1) {
              checks.push({ id: g.id, checked: true, genre: g.genre });
            } else {
              checks.push({ id: g.id, checked: false, genre: g.genre });
            }
          });

          // set state
          setBook({
            ...data.book,
            genres: checks,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id, jwtToken, navigate]);
  
  const handleSubmit = (event) => {
    event.preventDefault();

    let errors = [];
    let required = [
      { field: book.title, name: "title" },
      { field: book.release_date, name: "release_date" },
      { field: book.pages, name: "pages" },
      { field: book.rating, name: "rating" },
      { field: book.price, name: "price" },
      { field: book.description, name: "description" },
    ];

    required.forEach(function (obj) {
      if (obj.field === "") {
        errors.push(obj.name);
      }
    });

    if (book.genres_array.length === 0) {
      Swal.fire({
        title: "Error!",
        text: "You must choose at least one genre!",
        icon: "error",
        confirmButtonText: "OK",
      });
      errors.push("genres");
    }

    setErrors(errors);

    if (errors.length > 0) {
      return false;
    }

    // passed validation, so save changes
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + jwtToken);

    // assume we are adding a new book
    let method = "PUT";

    if (book.id > 0) {
      method = "PATCH";
    }

    const requestBody = book;
    // we need to covert the values in JSON for release date (to date)
    // and for pages to int

    requestBody.release_date = new Date(book.release_date);
    requestBody.pages = parseInt(book.pages);

    let requestOptions = {
      body: JSON.stringify(requestBody),
      method: method,
      headers: headers,
      credentials: "include",
    };

    fetch(`/admin/books/${book.id}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          navigate("/manage-catalogue");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChange = () => (event) => {
    let value = event.target.value;
    let name = event.target.name;
    setBook({
      ...book,
      [name]: value,
    });
  };

  const handleCheck = (event, position) => {
    console.log("handleCheck called");
    console.log("value in handleCheck:", event.target.value);
    console.log("checked is", event.target.checked);
    console.log("position is", position);

    let tmpArr = book.genres;
    tmpArr[position].checked = !tmpArr[position].checked;

    let tmpIDs = book.genres_array;
    if (!event.target.checked) {
      tmpIDs.splice(tmpIDs.indexOf(event.target.value));
    } else {
      tmpIDs.push(parseInt(event.target.value, 10));
    }

    setBook({
      ...book,
      genres_array: tmpIDs,
    });
  };

  const confirmDelete = () => {
    Swal.fire({
        title: 'Delete book?',
        text: "You cannot undo this action!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            let headers = new Headers();
            headers.append("Authorization", "Bearer " + jwtToken)

            const requestOptions = {
                method: "DELETE",
                headers: headers,
            }

          fetch(`/admin/books/${book.id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    navigate("/manage-catalogue");
                }
            })
            .catch(err => {console.log(err)});
        }
      })
  }

  if (error !== null) {
    return <div>Error: {error.message}</div>;
  } else {
    return (
      <div>
        <h2>Add/Edit Book</h2>
        <hr />

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={book.id} id="id"></input>
  {/* { field: book.title, name: "title" },
      { field: book.release_date, name: "release_date" },
      { field: book.pages, name: "pages" },
      { field: book.rating, name: "rating" },
      { field: book.rating, name: "price" },
      { field: book.description, name: "description" }, */}
          <Input
            title={"Title"}
            className={"form-control"}
            type={"text"}
            name={"title"}
            value={book.title}
            onChange={handleChange("title")}
            errorDiv={hasError("title") ? "text-danger" : "d-none"}
            errorMsg={"Please enter a title"}
          />

          <Input
            title={"Release Date"}
            className={"form-control"}
            type={"date"}
            name={"release_date"}
            value={book.release_date}
            onChange={handleChange("release_date")}
            errorDiv={hasError("release_date") ? "text-danger" : "d-none"}
            errorMsg={"Please enter a release date"}
          />

          <Input
            title={"Pages"}
            className={"form-control"}
            type={"text"}
            name={"pages"}
            value={book.pages}
            onChange={handleChange("pages")}
            errorDiv={hasError("pages") ? "text-danger" : "d-none"}
            errorMsg={"Please enter a pages"}
          />

          <Select
            title={"Rating"}
            name={"rating"}
            options={Options}
            value={book.rating}
            onChange={handleChange("rating")}
            placeHolder={"Choose..."}
            errorMsg={"Please choose"}
            errorDiv={hasError("rating") ? "text-danger" : "d-none"}
          />

          <Input
            title={"Price"}
            className={"form-control"}
            type={"text"}
            name={"price"}
            value={book.price}
            onChange={handleChange("price")}
            errorDiv={hasError("price") ? "text-danger" : "d-none"}
            errorMsg={"Please enter a price"}
          />

          <TextArea
            title="Description"
            name={"description"}
            value={book.description}
            rows={"3"}
            onChange={handleChange("description")}
            errorMsg={"Please enter a description"}
            errorDiv={hasError("description") ? "text-danger" : "d-none"}
          />

          <hr />

          <h3>Genres</h3>

          {book.genres && book.genres.length > 1 && (
            <>
              {Array.from(book.genres).map((g, index) => (
                <Checkbox
                  title={g.genre}
                  name={"genre"}
                  key={index}
                  id={"genre-" + index}
                  onChange={(event) => handleCheck(event, index)}
                  value={g.id}
                  checked={book.genres[index].checked}
                />
              ))}
            </>
          )}

          <hr />

          <button className="btn btn-primary">Save</button>

          {book.id > 0 && (
            <a href="#!" className="btn btn-danger ms-2" onClick={confirmDelete}>
              Delete Book
            </a>
          )}
        </form>
      </div>
    );
  }
};

export default EditBook;
