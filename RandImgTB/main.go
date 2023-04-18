package main

import (
	"context"
	"os"
	"os/signal"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"

	"RandImgTB/unsplash"
	"RandImgTB/variables"
)

// Send any text message to the bot after the bot has been started

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	opts := []bot.Option{
		bot.WithDefaultHandler(handler),
	}

	b, err := bot.New(variables.BotToken, opts...)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypeExact, handler)
	if err != nil {
		panic(err)
	}

	b.Start(ctx)
}

func SendImage(ctx context.Context, b *bot.Bot, update *models.Update) {
	photoChan := make(chan string)
	go func() {
		randomPhoto, _ := unsplash.RandomPhoto()
		photoChan <- randomPhoto
	}()

	select {
	case <-ctx.Done():
		return
	case photo := <-photoChan:
		params := &bot.SendPhotoParams{
			ChatID: update.Message.Chat.ID,
			Photo:  &models.InputFileString{Data: photo},
		}

		b.SendPhoto(ctx, params)
	}
}

func handler(ctx context.Context, b *bot.Bot, update *models.Update) {
	command := update.Message.Text

	switch command {

	case "/start":
		// Reply to the user with a welcome message
		b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: update.Message.Chat.ID,
			Text:   "Welcome to ImageHuntBot! To get started, type /image or image to receive a random photo.",
		})

	case "image", "/image":
		// Send the photo to the user
		go SendImage(ctx, b, update)

	default:
		// Reply to the user with a message indicating that the command is not supported
		b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: update.Message.Chat.ID,
			Text:   "I can only send random /image",
		})
	}
}
