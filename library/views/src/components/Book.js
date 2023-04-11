import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Book = () => {
    const [book, setBook] = useState({});
    let { id } = useParams();

    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/books/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBook(data);
            })
            .catch(err => {
                console.log(err);
            })
    }, [id])

    if (book.genres) {
        book.genres = Object.values(book.genres);
    } else {
        book.genres = [];
    }

    return(
        <div>
            <h2>Book: {book.title}</h2>
            <small><em>{book.release_date}, {book.pages} pages, Rated {parseFloat(book.rating).toPrecision(3)}</em></small><br />
            {book.genres.map((g) => (
                <span key={g.genre} className="badge bg-secondary me-2">{g.genre}</span>
            ))}
            <hr />

            {book.image !== "" &&
                <div className="mb-3">
                    <img src={`https://image.tmdb.org/t/p/w200/${book.image}`} alt="poster" />
                </div>
            }

            <p>{book.description}</p>
            <h2>Price: ${parseFloat(book.price).toPrecision(3)}</h2>
        </div>
    )
}

export default Book;