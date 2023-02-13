package entities

type Product struct {
	Id     string  `json:"id"`
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
	Rate   int     `json:"rate"`
	Status bool    `json:"status"`
}
