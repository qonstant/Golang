import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Input from './form/Input';

const GraphQL = () => {
    // set up stateful variables
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fullList, setFullList] = useState([]);

    // perform a search
    const performSearch = () => {
        const payload = `
        {
            search(titleContains: "${searchTerm}") {
                id
                title
                release_date
                pages
                rating
                price
            }
        }`;

        const headers = new Headers();
        headers.append("Content-Type", "application/graphql");

        const requestOptions = {
            method: "POST",
            body: payload,
            headers: headers,
        }

        fetch(`/graph`, requestOptions)
            .then((response) => response.json())
            .then((response) => {
                let theList = Object.values(response.data.search);
                setBooks(theList);
            })
            .catch(err => {console.log(err)})
    }

    const handleChange = (event) => {
        event.preventDefault();

        let value = event.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            performSearch();
        } else {
            setBooks(fullList);
        }
    }

    // useEffect
    useEffect(() => {
        const payload = `
        {
            list {
                id
                title
                release_date
                pages
                rating
                price
            }
        }`;

        const headers = new Headers();
        headers.append("Content-Type", "application/graphql");

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: payload,
        }

        fetch(`/graph`, requestOptions)
            .then((response) => response.json())
            .then((response) => {
                let theList = Object.values(response.data.list);
                setBooks(theList);
                setFullList(theList);
            })
            .catch(err => {console.log(err)})
    }, [])

    return(
        <div>
            <h2>GraphQL</h2>
            <hr />

            <form onSubmit={handleChange}>
                <Input
                    title={"Search"}
                    type={"search"}
                    name={"search"}
                    className={"form-control"}
                    value={searchTerm}
                    onChange={handleChange}/>
            </form>

            {books ? (
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
            ) : (
                <p>No books (yet)!</p>
            )}
        </div>
    )
}

export default GraphQL;