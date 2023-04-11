import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom"


const OneGenre = () => {
    // we need to get the "prop" passed to this component
    const location = useLocation();
    const { genreName } = location.state;

    // set stateful variables
    const [books, setBooks] = useState([]);

    // get the id from the url
    let { id } = useParams();

    // useEffect to get list of books
    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json")
        
        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/books/genres/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.log(data.message);
                } else {
                    setBooks(data);
                }
            })
            .catch(err => {console.log(err)});
    }, [id])

    // return jsx
    return (
        <>
            <h2>Genre: {genreName}</h2>

            <hr />

            {books ? (
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Release Date</th>
                        <th>Rating</th>
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
                            <td>${parseFloat(b.price).toPrecision(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            ) : (
                <p>No books in this genre (yet)!</p>
            )}
        </>
    )
}

export default OneGenre;