package models

type Comment struct {
	ID      int    `json:"id"`
	BookID  int    `json:"book_id"`
	UserID  int    `json:"user_id"`
	Comment string `json:"comment"`
	Date    string `json:"created_at"`
}
