package graph

import (
	"library/internal/models"
	"errors"
	"strings"

	"github.com/graphql-go/graphql"
)

// Graph is the type for our graphql operations
type Graph struct {
	Books      []*models.Book
	QueryString string
	Config      graphql.SchemaConfig
	fields      graphql.Fields
	bookType   *graphql.Object
}

// New is the factory method to create a new instance of the Graph type.
func New(books []*models.Book) *Graph {

	// Define the object for our book. The fields match database field names.
	var bookType = graphql.NewObject(
		graphql.ObjectConfig{
			Name: "Book",
			Fields: graphql.Fields{
				"id": &graphql.Field{
					Type: graphql.Int,
				},
				"title": &graphql.Field{
					Type: graphql.String,
				},
				"release_date": &graphql.Field{
					Type: graphql.DateTime,
				},
				"pages": &graphql.Field{
					Type: graphql.Int,
				},
				"rating": &graphql.Field{
					Type: graphql.Float,
				},
				"price": &graphql.Field{
					Type: graphql.Float,
				},
				"description": &graphql.Field{
					Type: graphql.String,
				},
				"image": &graphql.Field{
					Type: graphql.String,
				},
			},
		},
	)

	// define a fields variable, which lists available actions (list, search, get)
	var fields = graphql.Fields{
		"list": &graphql.Field{
			Type:        graphql.NewList(bookType),
			Description: "Get all books",
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				return books, nil
			},
		},

		"search": &graphql.Field{
			Type:        graphql.NewList(bookType),
			Description: "Search books by title",
			Args: graphql.FieldConfigArgument{
				"titleContains": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				var theList []*models.Book
				search, ok := params.Args["titleContains"].(string)
				if ok {
					for _, currentBook := range books {
						if strings.Contains(strings.ToLower(currentBook.Title), strings.ToLower(search)) {
							theList = append(theList, currentBook)
						}
					}
				}
				return theList, nil
			},
		},

		"get": &graphql.Field{
			Type:        bookType,
			Description: "Get book by id",
			Args: graphql.FieldConfigArgument{
				"id": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				id, ok := p.Args["id"].(int)
				if ok {
					for _, book := range books {
						if book.ID == id {
							return book, nil
						}
					}
				}
				return nil, nil
			},
		},
	}

	// return a pointer to the Graph type, populated with the correct information
	return &Graph{
		Books:    books,
		fields:    fields,
		bookType: bookType,
	}

}

func (g *Graph) Query() (*graphql.Result, error) {
	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: g.fields}
	schemaConfig := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConfig)
	if err != nil {
		return nil, err
	}

	params := graphql.Params{Schema: schema, RequestString: g.QueryString}
	resp := graphql.Do(params)
	if len(resp.Errors) > 0 {
		return nil, errors.New("error executing query")
	}

	return resp, nil
}