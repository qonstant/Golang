package repository

import (
	"library/internal/models"
	"database/sql"
)


type DatabaseRepo interface {
	Connection() *sql.DB
	AllBooks(genre ...int) ([]*models.Book, error)
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id int) (*models.User, error)

	OneBookForEdit(id int) (*models.Book, []*models.Genre, error)
	OneBook(id int) (*models.Book, error)
	AllGenres() ([]*models.Genre, error)
	InsertBook(book models.Book) (int, error)
	UpdateBookGenres(id int, genreIDs []int) error
	UpdateBook(book models.Book) error
	DeleteBook(id int) error
}