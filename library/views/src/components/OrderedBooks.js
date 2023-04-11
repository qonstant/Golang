import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const OrderedBooks = () => {
    const [books, setBooks] = useState([]);
    let { order } = useParams();
    let link = "/books_ordered/"

    useEffect( () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/books_ordered/${order}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBooks(data);
            })
            .catch(err => {
                console.log(err);
            })

    }, [order]);

    if (order == "asc") {
        link += "desc";
    } else if (order == "desc"){
        link += "asc";
    }

    return(
        <div>
            <h2>Books ordered by {order}ending order</h2>
            <div className="col-md-1 offset-md-11">
                <Link to={link}>
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

export default OrderedBooks;