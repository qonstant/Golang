import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";

const Book = () => {
    const [book, setBook] = useState({});
    const [address, setAddress] = useState("");
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const { id } = useParams();
    const { jwtToken } = useOutletContext();
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");


    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const handlePurchase = () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + jwtToken);

        const requestOptions = {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({ address: address }),
        };

        fetch(`/books/${id}/purchase`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                console.log("Purchase response:", data);
                if (data.error && data.message === "invalid Auth header") {
                    // handle the error here, for example:
                    alert("You are need to login first");
                } else {
                    setPurchaseSuccess(true);
                    setAddress("");
                }
            })
            .catch((error) => {
                console.error("Purchase error:", error);
            });
    };

    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: headers,
        };

        fetch(`/books/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBook(data);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });

        fetch(`/books/${id}/comments`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                const promises = data.map((comment) => {
                    return fetch(`/home/${comment.user_id}`, requestOptions)
                        .then((response) => response.json())
                        .then((userData) => {
                            comment.username = `${userData.first_name} ${userData.last_name}`;
                            return comment;
                        });
                });

                Promise.all(promises).then((commentsWithUsernames) => {
                    setComments(commentsWithUsernames);
                });
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, [id]);


    if (book.genres) {
        book.genres = Object.values(book.genres);
    } else {
        book.genres = [];
    }

    return (
        <div>
            <h2>Book: {book.title}</h2>

            <small>
                <em>
                    {book.release_date}, {book.pages} pages, Rated{" "}
                    {parseFloat(book.rating).toPrecision(3)}
                </em>
            </small>
            <br />
            {book.genres.map((g) => (
                <span key={g.genre} className="badge bg-secondary me-2">
                    {g.genre}
                </span>
            ))}
            <hr />

            {book.image !== "" && (
                <div className="mb-3">
                    <img
                        src={`https://image.tmdb.org/t/p/w200/${book.image}`}
                        alt="poster"
                    />
                </div>
            )}

            <p>{book.description}</p>
            <h2>Price: ${parseFloat(book.price).toPrecision(3)}</h2>

            {purchaseSuccess ? (
                <p>Thank You for Your purchase!</p>
            ) : (
                <div>
                    <div className="form-group">
                        <label htmlFor="addressInput">Address:</label>
                        <input type="text"
                            className="form-control"
                            id="addressInput"
                            placeholder="Enter your address"
                            value={address}
                            onChange={handleAddressChange}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handlePurchase}
                    >
                        Buy
                    </button>
                </div>
            )}
            <div className="form-group">
                <label htmlFor="commentInput">Comment:</label>
                <input
                    type="text"
                    className="form-control"
                    id="commentInput"
                    placeholder="Enter your comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                    const headers = new Headers();
                    headers.append("Content-Type", "application/json");
                    headers.append("Authorization", "Bearer " + jwtToken);

                    const requestOptions = {
                        method: "PUT",
                        headers: headers,
                        body: JSON.stringify({ comment: comment }),
                    };

                    // Update the comments state with the new comment
                    const newComment = { id: comments.length + 1, comment: comment, user_id: 1 };
                    setComments([...comments, newComment]);

                    fetch(`/books/${id}/commenting`, requestOptions)
                        .then((response) => response.json())
                        .then((data) => {
                            console.log("Comment response:", data);
                            setComment("");
                        })
                        .catch((error) => {
                            console.error("Comment error:", error);
                        });
                }}
            >
                Post Comment
            </button>




            {/* Comments section */}
            <h2>Comments</h2>
            {comments ? (
                <ul>
                    {comments.map((c) => (
                        <li key={c.id}>
                            <p>{c.comment}</p>
                            <small>
                                By {c.username} on {c.created_at}
                            </small>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
};

export default Book;