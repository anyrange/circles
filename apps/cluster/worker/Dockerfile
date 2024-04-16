FROM golang:1.22.2-alpine

WORKDIR /worker

COPY go.mod ./
RUN go mod download && go mod verify

COPY . .
RUN GOOS=linux go build -v -o /app

ARG VERSION_TAG
ENV VERSION_TAG=$VERSION_TAG

CMD ["/app"]
