FROM golang:1.22.2-alpine

WORKDIR /worker

COPY go.mod ./
RUN go mod download && go mod verify

COPY . .
RUN GOOS=linux go build -v -o /app

CMD ["/app"]
