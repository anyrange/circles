package tasks

type Job struct {
	Id   string
	Args any
}

type Task interface {
	Create() []Job
	Execute(Job) error
}
