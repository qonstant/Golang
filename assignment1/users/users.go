package users

import (
    "golang.org/x/crypto/bcrypt"
	"errors"
	"assignment1/controllers/democontroller"
)

type User struct { 
	Email string
	Password string
}

type authUser struct {
	email string
	passwordHash string
}

type userService struct {
}

var authUserDB = map[string]authUser{} // email => authUser{email, hash}

var DefaultUserService userService


func (userService) VerifyUser(user User) bool {
	authUser, ok := authUserDB[user.Email]
	// contoller.democontroller.Name = user.Email
	democontroller.Name = user.Email
	if !ok {
		democontroller.Name = "GUEST"
		return false
	} 
	err := bcrypt.CompareHashAndPassword(
		[]byte(authUser.passwordHash),
		[]byte(user.Password))
	return err == nil 
}

func getPasswordHash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 0)
	return string(hash), err
}

func (userService) CreateUser(newUser User) error {
	_, ok := authUserDB[newUser.Email]
	if ok && len(authUserDB) > 0 {
		democontroller.Name = "GUEST"
		return errors.New("User already exists")
	}
	passwordHash, err := getPasswordHash(newUser.Password)
	if err != nil {
		democontroller.Name = "GUEST"
		return err
	} 
	// else {
	// 	getName(newUser)
	// }
	newAuthUser := authUser{
		email: newUser.Email,
		passwordHash: passwordHash,
	}
	democontroller.Name = newUser.Email
	authUserDB[newAuthUser.email] = newAuthUser
	return nil
}
