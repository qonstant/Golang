package dbrepo

import (
	"library/internal/models"
	"context"
	"database/sql"
	"fmt"
	"time"
)

// PostgresDBRepo is the struct used to wrap our database connection pool, so that we
// can easily swap out a real database for a test database, or move to another database
// entirely, as long as the thing being swapped implements all of the functions in the type
// repository.DatabaseRepo.
type PostgresDBRepo struct {
	DB *sql.DB
}

const dbTimeout = time.Second * 3

// Connection returns underlying connection pool.
func (b *PostgresDBRepo) Connection() *sql.DB {
	return b.DB
}

// AllBooks returns a slice of books, sorted by name. If the optional parameter genre
// is supplied, then only all books for a particular genre is returned.
func (b *PostgresDBRepo) AllBooks(genre ...int) ([]*models.Book, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	where := ""
	if len(genre) > 0 {
		where = fmt.Sprintf("where id in (select book_id from books_genres where genre_id = %d)", genre[0])
	}

	query := fmt.Sprintf(`
		select
			id, title, release_date, pages,
			rating, price, description, coalesce(image, '')
		from
			books %s
		order by
			title
	`, where)

	rows, err := b.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*models.Book

	for rows.Next() {
		var book models.Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.ReleaseDate,
			&book.Pages,
			&book.Rating,
			&book.Price,
			&book.Description,
			&book.Image,
		)
		if err != nil {
			return nil, err
		}

		books = append(books, &book)
	}

	return books, nil
}

// OneBook returns a single book and associated genres, if any.
func (b *PostgresDBRepo) OneBook(id int) (*models.Book, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, title, release_date, pages, rating, price,
		description, coalesce(image, '')
		from books where id = $1`

	row := b.DB.QueryRowContext(ctx, query, id)

	var book models.Book

	err := row.Scan(
		&book.ID,
		&book.Title,
		&book.ReleaseDate,
		&book.Pages,
		&book.Rating,
		&book.Price,
		&book.Description,
		&book.Image,
	)

	if err != nil {
		return nil, err
	}

	// get genres, if any
	query = `select g.id, g.genre from books_genres bg
		left join genres g on (bg.genre_id = g.id)
		where bg.book_id = $1
		order by g.genre`

	rows, err := b.DB.QueryContext(ctx, query, id)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()

	var genres []*models.Genre
	for rows.Next() {
		var g models.Genre
		err := rows.Scan(
			&g.ID,
			&g.Genre,
		)
		if err != nil {
			return nil, err
		}

		genres = append(genres, &g)
	}

	book.Genres = genres

	return &book, err
}

// OneBookForEdit returns a single book and associated genres, if any, for edit.
func (b *PostgresDBRepo) OneBookForEdit(id int) (*models.Book, []*models.Genre, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	// query := `select id, title, release_date, pages, rating, price, description, coalesce(image, '') 
	// 		from books where id = $1`
	query := `select id, title, release_date, pages, rating, 
		price, description, coalesce(image, '')
		from books where id = $1`

	row := b.DB.QueryRowContext(ctx, query, id)

	var book models.Book

	err := row.Scan(
		&book.ID,
		&book.Title,
		&book.ReleaseDate,
		&book.Pages,
		&book.Rating,
		&book.Price,
		&book.Description,
		&book.Image,
	)

	if err != nil {
		return nil, nil, err
	}

	// get genres, if any
	query = `select g.id, g.genre from books_genres bg
	left join genres g on (bg.genre_id = g.id)
	where bg.book_id = $1
	order by g.genre`

	rows, err := b.DB.QueryContext(ctx, query, id)
	if err != nil && err != sql.ErrNoRows {
		return nil, nil, err
	}
	defer rows.Close()

	var genres []*models.Genre
	var genresArray []int

	for rows.Next() {
		var g models.Genre
		err := rows.Scan(
			&g.ID,
			&g.Genre,
		)
		if err != nil {
			return nil, nil, err
		}

		genres = append(genres, &g)
		genresArray = append(genresArray, g.ID)
	}

	book.Genres = genres
	book.GenresArray = genresArray

	var allGenres []*models.Genre

	query = "select id, genre from genres order by genre"
	gRows, err := b.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	defer gRows.Close()

	for gRows.Next() {
		var g models.Genre
		err := gRows.Scan(
			&g.ID,
			&g.Genre,
		)
		if err != nil {
			return nil, nil, err
		}

		allGenres = append(allGenres, &g)
	}

	return &book, allGenres, err
}

// GetUserByEmail returns one use, by email.
func (b *PostgresDBRepo) GetUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, email, first_name, last_name, password,
			created_at, updated_at from users where email = $1`

	var user models.User
	row := b.DB.QueryRowContext(ctx, query, email)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByID returns one use, by ID.
func (b *PostgresDBRepo) GetUserByID(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, email, first_name, last_name, password, 
		created_at, updated_at from users where id = $1`

	var user models.User
	row := b.DB.QueryRowContext(ctx, query, id)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// AllGenres returns a slice of genres, sorted by name.
func (b *PostgresDBRepo) AllGenres() ([]*models.Genre, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, genre from genres order by genre`

	rows, err := b.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*models.Genre

	for rows.Next() {
		var g models.Genre
		err := rows.Scan(
			&g.ID,
			&g.Genre,
		)
		if err != nil {
			return nil, err
		}

		genres = append(genres, &g)
	}

	return genres, nil
}

// InsertBook inserts one book into the database.
func (b *PostgresDBRepo) InsertBook(book models.Book) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `insert into books (title, release_date, pages, rating, price, description, image)
			values ($1, $2, $3, $4, $5, $6, $7) returning id`

	var newID int

	err := b.DB.QueryRowContext(ctx, stmt,
		book.Title,
		book.ReleaseDate,
		book.Pages,
		book.Rating,
		book.Price,
		book.Description,
		book.Image,
	).Scan(&newID)

	if err != nil {
		return 0, err
	}

	return newID, nil
}

// UpdateBook updates one book in the database.
func (b *PostgresDBRepo) UpdateBook(book models.Book) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `update books set title = $1, description = $2, release_date = $3,
				pages = $4, rating = $5,
				price = $6, image = $7 where id = $8`

	_, err := b.DB.ExecContext(ctx, stmt,
		book.Title,
		book.Description,
		book.ReleaseDate,
		book.Pages,
		book.Rating,
		book.Price,
		book.Image,
		book.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

// UpdateBookGenres first deletes all genres associated with a book, and
// then inserts the ones stored in genreIDs.
func (b *PostgresDBRepo) UpdateBookGenres(id int, genreIDs []int) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `delete from books_genres where book_id = $1`

	_, err := b.DB.ExecContext(ctx, stmt, id)
	if err != nil {
		return err
	}

	for _, n := range genreIDs {
		stmt := `insert into books_genres (book_id, genre_id) values ($1, $2)`
		_, err := b.DB.ExecContext(ctx, stmt, id, n)
		if err != nil {
			return err
		}
	}

	return nil
}

// DeleteBook deletes one book, by id.
func (b *PostgresDBRepo) DeleteBook(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `delete from books where id = $1`

	_, err := b.DB.ExecContext(ctx, stmt, id)
	if err != nil {
		return err
	}

	return nil
}
