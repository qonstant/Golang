FROM golang:1.19.7-alpine3.17

WORKDIR /app

COPY . .

RUN go build -o main ./api

# EXPOSE 8080

CMD ["/app/main"]
