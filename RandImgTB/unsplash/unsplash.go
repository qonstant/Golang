package unsplash

import (
	"RandImgTB/variables"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func RandomPhoto() (string, error) {
	url := variables.UnsplashAPI + variables.UnsplashToken
	respChan := make(chan *http.Response)
	errChan := make(chan error)

	go func() {
		resp, err := http.Get(url)
		if err != nil {
			errChan <- err
			return
		}
		respChan <- resp
	}()

	select {
	case resp := <-respChan:
		defer resp.Body.Close()
		var data map[string]interface{}
		err := json.NewDecoder(resp.Body).Decode(&data)
		if err != nil {
			return "", err
		}

		urls, ok := data["urls"].(map[string]interface{})
		if !ok {
			return "", fmt.Errorf("no urls found")
		}

		photo, ok := urls["small"].(string)
		if !ok {
			return "", fmt.Errorf("url is not found")
		}

		return photo, nil

	case err := <-errChan:
		return "", err

	case <-time.After(5 * time.Second):
		return "", fmt.Errorf("request timed out")
	}
}
