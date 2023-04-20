package main

import (
	"library/internal/repository/dbrepo"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"
	"library/controller"
)

const port = 8080

func main() {
	// set application config
	var app controller.Application

	// read from command line
	flag.StringVar(&app.DSN, "dsn", "host=library-postgres-1 port=5432 user=postgres password=postgres dbname=postgres sslmode=disable timezone=UTC connect_timeout=5", "Postgres connection string")
	// flag.StringVar(&app.DSN, "dsn", "host=192.168.32.2 port=5432 user=postgres password=postgres dbname=library sslmode=disable timezone=UTC connect_timeout=5", "Postgres connection string")
	flag.StringVar(&app.JWTSecret, "jwt-secret", "verysecret", "signing secret")
	flag.StringVar(&app.JWTIssuer, "jwt-issuer", "example.com", "signing issuer")
	flag.StringVar(&app.JWTAudience, "jwt-audience", "example.com", "signing audience")
	flag.StringVar(&app.CookieDomain, "cookie-domain", "localhost", "cookie domain")
	flag.StringVar(&app.Domain, "domain", "example.com", "domain")
	flag.StringVar(&app.APIKey, "api-key", "a696843dcb19cba1ddf454df0c93192c", "api key")
	flag.Parse()

	// connect to the database
	conn, err := app.ConnectToDB()
	if err != nil {
		log.Fatal(err)
	}
	app.DB = &dbrepo.PostgresDBRepo{DB: conn}
	defer app.DB.Connection().Close()

	app.Auth = controller.Auth{
		Issuer: app.JWTIssuer,
		Audience: app.JWTAudience,
		Secret: app.JWTSecret,
		TokenExpiry: time.Minute * 15,
		RefreshExpiry: time.Hour * 24,
		CookiePath: "/",
		CookieName: "__Host-refresh_token",
		CookieDomain: app.CookieDomain,
	}

	log.Println("Starting application on port", port)

	// start a web server
	err = http.ListenAndServe(fmt.Sprintf(":%d", port), app.Routes())
	if err != nil {
		log.Fatal(err)
	}
}