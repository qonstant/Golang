import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import EditBook from './components/EditBook';
import ErrorPage from './components/ErrorPage';
import Genres from './components/Genres';
import GraphQL from './components/GraphQL';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ManageCatalogue from './components/ManageCatalogue';
import Books from './components/Books';
import Book from './components/Book';
import OneGenre from './components/OneGenre';
import OrderedByPriceBooks from './components/OrderedByPriceBooks';
import OrderedByRatingBooks from './components/OrderedByRatingBooks';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {index: true, element: <Home /> },
      {
        path: "/books",
        element: <Books />,
      },
      {
        path: "/books/:id",
        element: <Book />,
      },
      {
        path: "/genres",
        element: <Genres />,
      },
      {
        path: "/genres/:id",
        element: <OneGenre />
      },
      {
        path: "/admin/book/0",
        element: <EditBook />,
      },
      {
        path: "/admin/book/:id",
        element: <EditBook />,
      },
      {
        path: "/manage-catalogue",
        element: <ManageCatalogue />,
      },
      {
        path: "/graphql",
        element: <GraphQL />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/books/ordered/price/:order",
        element: <OrderedByPriceBooks />,
      },
      {
        path: "/books/ordered/rating/:order",
        element: <OrderedByRatingBooks />,
      },
    ]
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
