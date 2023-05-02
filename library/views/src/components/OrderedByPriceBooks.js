import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const OrderedByPriceBooks = () => {
    const [books, setBooks] = useState([]);
    let { order } = useParams();
    let priceLink = order === "asc" ? "/books/ordered/price/desc" : "/books/ordered/price/asc";
    let ratingLink = order === "asc" ? "/books/ordered/rating/desc" : "/books/ordered/rating/asc";

    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: headers,
        };

        let url;
        if (order.startsWith("price")) {
            url = `/books/ordered/price/${order}`;
        } else {
            url = `/books/ordered/rating/${order}`;
        }

        fetch(url, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBooks(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [order]);

    return (
        <div>
            <h2>Books ordered by {order.endsWith("asc") ? "ascending" : "descending"} order</h2>
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

export default OrderedByPriceBooks;
