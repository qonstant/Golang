import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

const ManageCatalogue = () => {
    const [books, setBooks] = useState([]);
    const { jwtToken } = useOutletContext();
    const navigate = useNavigate();

    useEffect( () => {
        if (jwtToken === "") {
            navigate("/login");
            return
        }
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + jwtToken);

        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/admin/books`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setBooks(data);
            })
            .catch(err => {
                console.log(err);
            })

    }, [jwtToken, navigate]);

    return(
        <div>
            <h2>Manage Catalogue</h2>
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
                {books.map((m) => (
                        <tr key={m.id}>
                            <td>
                                <Link to={`/admin/book/${m.id}`}>
                                    {m.title}
                                </Link>
                            </td>
                            <td>{m.release_date}</td>
                            <td>{parseFloat(m.rating).toPrecision(3)}</td>
                            <td>{m.pages}</td>
                            <td>${parseFloat(m.price).toPrecision(3)}</td>
                        </tr>    
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ManageCatalogue;