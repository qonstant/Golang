import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useParams } from "react-router-dom";

const Books = () => {
  const [books, setBooks] = useState([]);
  const { order } = useParams();
  const navigate = useNavigate();
  const { jwtToken } = useOutletContext();

  useEffect(() => {
    if (jwtToken === "") {
      navigate("/login");
      return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    let url = "/books";

    if (order) {
      url = `/books/ordered/${order}`;
    }

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setBooks(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [jwtToken, navigate, order]);

  const getSortLinks = () => {
    let priceLink = "/books/ordered/price/asc";
    let ratingLink = "/books/ordered/rating/asc";

    if (order === "price/asc") {
      priceLink = "/books/ordered/price/desc";
    } else if (order === "price/desc") {
      priceLink = "/books";
    }

    if (order === "rating/asc") {
      ratingLink = "/books/ordered/rating/desc";
    } else if (order === "rating/desc") {
      ratingLink = "/books";
    }

    return (
        <div className="row">
            <div className="col-md-3 offset-md-9 d-flex">
                <Link to={ratingLink}>
                    <button type="button" className="btn btn-primary">
                        Sort By Rating
                    </button>
                </Link>
                <Link to={priceLink}>
                    <button type="button" className="btn btn-primary">
                        Sort By Price
                    </button>
                </Link>
            </div>
        </div>
    );
  };

  return (
    <div>
      <h2>Books</h2>
        {getSortLinks()}
      <hr />
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Book</th>
            <th>Release Date</th>
            <th>Rating</th>
            <th>Pages</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>
                <Link to={`/books/${b.id}`}>{b.title}</Link>
              </td>
              <td>{new Date(b.release_date).toLocaleDateString()}</td>
              <td>{parseFloat(b.rating).toPrecision(3)}</td>
              <td>{b.pages}</td>
              <td>${parseFloat(b.price).toPrecision(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
