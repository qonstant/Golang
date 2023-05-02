package models

type Purchase struct {
	ID      int    `json:"id"`
	UserID  int    `json:"user_id"`
	BookID  int    `json:"book_id"`
	Address string `json:"address"`
	Date    string `json:"created_at"`
}
