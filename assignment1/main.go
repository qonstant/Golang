package main

import (
	"assignment1/controllers/democontroller"
	"assignment1/users"
	"net/http"
	"text/template"
)

func templating(w http.ResponseWriter, filename string, data interface{}) {
	t, _ := template.ParseFiles(filename)
	t.ExecuteTemplate(w, filename, data)
}

func getSignInPage(w http.ResponseWriter, r *http.Request) {
	templating(w, "sign-in.html", nil)
} 

func getSignUpPage(w http.ResponseWriter, r *http.Request) {
	templating(w, "sign-up.html", nil)
}

func getUser(r *http.Request) users.User {
	email := r.FormValue("email")
	password := r.FormValue("password")
	return users.User{Email: email,
		Password: password,
	}
}

func signInUser(w http.ResponseWriter, r *http.Request) {
	newUser := getUser(r)
	ok := users.DefaultUserService.VerifyUser(newUser)
	if !ok {
		fileName := "sign-in.html"
		t, _ := template.ParseFiles(fileName)
		democontroller.Name = "GUEST"
		t.ExecuteTemplate(w, fileName, "User Sign-in Failure")
		return
	}
	fileName := "sign-in.html"
	t, _ := template.ParseFiles(fileName)
	t.ExecuteTemplate(w, fileName, "User Sign-in Success")
	return
}

func signUpUser(w http.ResponseWriter, r *http.Request) {
	newUser := getUser(r)
	err := users.DefaultUserService.CreateUser(newUser)
	if err != nil {
		fileName := "sign-up.html"
		t, _ := template.ParseFiles(fileName)
		democontroller.Name = "GUEST"
		t.ExecuteTemplate(w, fileName, "New User Sign-up Failure, Try Again")
		return
	}
	fileName := "sign-up.html"
	t, _ := template.ParseFiles(fileName)
	t.ExecuteTemplate(w, fileName, "New User Sign-up Success")
	return
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/sign-in":
		signInUser(w, r)
	case "/sign-up":
		signUpUser(w, r)
	case "/sign-in-form":
		getSignInPage(w, r)
	case "/sign-up-form":
		getSignUpPage(w, r)
	default:

	}
}

func main() {
	http.HandleFunc("/", userHandler)
	http.HandleFunc("/demo", democontroller.Index)
	http.HandleFunc("/demo/display1", democontroller.Display1)
	// http.HandleFunc("/demo/display3", democontroller.Display3)
	http.HandleFunc("/demo/display2", democontroller.ByName)
	http.HandleFunc("/demo/byrate", democontroller.ByRate)
	http.HandleFunc("/demo/byprice", democontroller.ByPrice)
	http.HandleFunc("/demo/productpage", democontroller.GetProduct)
	http.HandleFunc("/demo/thanks", democontroller.ChangeRate)
	http.ListenAndServe(":8080", nil)
}
