package democontroller

import (
	"assignment1/entities"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"sort"
	"strconv"
	"github.com/gorilla/sessions"
	"io/ioutil"
)

var Name string = "GUEST"

var store = sessions.NewCookieStore([]byte("mykey"))

func Index(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")

	session.Values["username"] = Name

	// product := entities.Product{
	// 	Id:     "Wait",
	// 	Name:   "Very soon",
	// 	Price:  0,
	// 	Rate:   5,
	// 	Status: true,
	// }
	// strProduct, _ := json.Marshal(product)
	// session.Values["product"] = string(strProduct)

	// products := []entities.Product{
	// 	entities.Product{
	// 		Id:     "001",
	// 		Name:   "Milk",
	// 		Price:  4.5,
	// 		Rate:   3,
	// 		Status: true,
	// 	},
	// 	entities.Product{
	// 		Id:     "002",
	// 		Name:   "Cigarettes",
	// 		Price:  5.0,
	// 		Rate:   1,
	// 		Status: true,
	// 	},
	// 	entities.Product{
	// 		Id:     "003",
	// 		Name:   "Vodka",
	// 		Price:  6.7,
	// 		Rate:   3,
	// 		Status: false,
	// 	},
	// 	entities.Product{
	// 		Id:     "004",
	// 		Name:   "Bred",
	// 		Price:  4.5,
	// 		Rate:   4,
	// 		Status: true,
	// 	},
	// 	entities.Product{
	// 		Id:     "005",
	// 		Name:   "Tequila",
	// 		Price:  100,
	// 		Rate:   3,
	// 		Status: true,
	// 	},
	// 	entities.Product{
	// 		Id:     "006",
	// 		Name:   "Potato",
	// 		Price:  0.5,
	// 		Rate:   5,
	// 		Status: true,
	// 	},
	// }

	content, _ := ioutil.ReadFile("entities/products.json")
	var products []entities.Product
	json.Unmarshal([]byte(content), &products)

	strProducts, _ := json.Marshal(products)
	session.Values["products"] = string(strProducts)

	session.Save(request, response)

	tmp, _ := template.ParseFiles("views/demo/index.html")
	tmp.Execute(response, nil)
}

func Display1(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")
	// var username string = session.Values["username"]
	// username := users.Name
	username := session.Values["username"]
	data := map[string]interface{}{
		"username": username,
	}

	tmp, _ := template.ParseFiles("views/demo/display1.html")
	tmp.Execute(response, data)
}

func Display2(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")

	strProduct := session.Values["product"].(string)
	var product entities.Product
	json.Unmarshal([]byte(strProduct), &product)

	data := map[string]interface{}{
		"product": product,
	}

	tmp, _ := template.ParseFiles("views/demo/display2.html")
	tmp.Execute(response, data)
}

func getRate(r *http.Request) int {
	searchingValue := r.FormValue("rate")
	num, err := strconv.Atoi(searchingValue)
	if err != nil {
		fmt.Println(err)
		return 0
	}
	return num
}

func getPrice(r *http.Request) float64 {
	searchingValue := r.FormValue("price")
	num, err := strconv.Atoi(searchingValue)
	if err != nil {
		fmt.Println(err)
		return 99999
	}
	return float64(num)
}

func getName(r *http.Request) string {
	searchingName := r.FormValue("name")
	return searchingName

}

func ChangeRate(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")
	username := session.Values["username"]
	data := map[string]interface{}{
		"username": username,
	}

	id := request.FormValue("id")

	searchingValue := request.FormValue("new_rate")
	newRate, _ := strconv.Atoi(searchingValue)

	content := session.Values["products"].(string)
	var products []entities.Product
	json.Unmarshal([]byte(content), &products)

	var changedProducts []entities.Product
	for _, product := range products {
		if product.Id == id {
			product.Rate = newRate
		} 
		changedProducts = append(changedProducts, product)
	}
	strProducts, _ := json.Marshal(changedProducts)

	session.Values["products"] = string(strProducts)

	session.Save(request, response)
	ioutil.WriteFile("entities/products.json", strProducts, 0644)
	tmp, _ := template.ParseFiles("views/demo/thanks.html")
	tmp.Execute(response, data)

}

// func Display3(response http.ResponseWriter, request *http.Request) {
// 	session, _ := store.Get(request, "session1")

// 	strProducts := session.Values["products"].(string)
// 	var products []entities.Product
// 	json.Unmarshal([]byte(strProducts), &products)

// 	data := map[string]interface{}{
// 		"products": products,
// 	}

// 	tmp, _ := template.ParseFiles("views/demo/display3.html")
// 	tmp.Execute(response, data)
// }

func ByPrice(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")

	value := getPrice(request)

	strProducts := session.Values["products"].(string)
	var products []entities.Product
	json.Unmarshal([]byte(strProducts), &products)

	// Create a new slice to hold products whose price is below "value"
	var filteredProducts []entities.Product
	for _, product := range products {
		if product.Price <= value {
			filteredProducts = append(filteredProducts, product)
		}
	}

	// Sort the filtered products by price
	sort.Slice(filteredProducts, func(i, j int) bool {
		return filteredProducts[i].Price < filteredProducts[j].Price
	})

	data := map[string]interface{}{
		"products": filteredProducts,
	}

	tmp, _ := template.ParseFiles("views/demo/byprice.html")
	tmp.Execute(response, data)
}

func ByName(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")

	name := getName(request)

	strProducts := session.Values["products"].(string)
	var products []entities.Product
	json.Unmarshal([]byte(strProducts), &products)

	// Create a new slice to hold products whose price is below "value"
	var filteredProducts []entities.Product
	for _, product := range products {
		if product.Name == name {
			filteredProducts = append(filteredProducts, product)
		}
	}

	// Sort the filtered products by price
	sort.Slice(filteredProducts, func(i, j int) bool {
		return filteredProducts[i].Price < filteredProducts[j].Price
	})

	data := map[string]interface{}{
		"products": filteredProducts,
	}

	tmp, _ := template.ParseFiles("views/demo/display2.html")
	tmp.Execute(response, data)
}

func ByRate(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")

	value := getRate(request)

	strProducts := session.Values["products"].(string)
	var products []entities.Product
	json.Unmarshal([]byte(strProducts), &products)

	// Create a new slice to hold products whose price is below "value"
	var filteredProducts []entities.Product
	for _, product := range products {
		if product.Rate >= value {
			filteredProducts = append(filteredProducts, product)
		}
	}

	// Sort the filtered products by price
	sort.Slice(filteredProducts, func(i, j int) bool {
		return filteredProducts[i].Rate < filteredProducts[j].Rate
	})

	data := map[string]interface{}{
		"products": filteredProducts,
	}

	tmp, _ := template.ParseFiles("views/demo/byrate.html")
	tmp.Execute(response, data)
}

func GetProduct(response http.ResponseWriter, request *http.Request) {
	session, _ := store.Get(request, "session1")
	
	id := request.FormValue("id")
	// value := getRate(request)

	strProducts := session.Values["products"].(string)
	var products []entities.Product
	json.Unmarshal([]byte(strProducts), &products)

	// Create a new slice to hold products whose price is below "value"

	var target entities.Product

	for _, product := range products {
		if id == product.Id {
			target = product
		}
	}

	tmp, _ := template.ParseFiles("views/demo/productpage.html")
	tmp.Execute(response, target)
}

func SortHandler(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/demo/byprice":
		ByPrice(w, r)
	case "/demo/byrate":
		ByRate(w, r)
	case "/demo/display2":
		ByName(w, r)
	default:

	}
}
