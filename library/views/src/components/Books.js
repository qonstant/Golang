import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Books = () => {
    const [books, setBooks] = useState([]);

    useEffect( () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/books`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBooks(data);
            })
            .catch(err => {
                console.log(err);
            })

    }, []);

    return(
        <div>
            <h2>Books</h2>
            <div className="col-md-1 offset-md-11">
                <Link to="/books_ordered/desc">
                    <button type="button" class="btn btn-primary">Sort</button>
                </Link>
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
                                <Link to={`/books/${b.id}`}>
                                    {b.title}
                                </Link>
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
    )
}

export default Books;