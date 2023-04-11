package models

import "time"

type Book struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	ReleaseDate time.Time `json:"release_date"`
	Pages       int       `json:"pages"`
	Rating      float64   `json:"rating,string"`
	Price       float64   `json:"price,string"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	Genres      []*Genre  `json:"genres,omitempty"`
	GenresArray []int     `json:"genres_array,omitempty"`
}

type Genre struct {
	ID      int    `json:"id"`
	Genre   string `json:"genre"`
	Checked bool   `json:"checked"`
}
