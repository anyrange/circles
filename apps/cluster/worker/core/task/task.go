package task

type Job struct {
	Id   string
	Args any
}

type Parse_job[T any] struct {
	Id   string `json:"Id"`
	Args T      `json:"Args"`
}

type Task interface {
	Create() []Job
	Execute(Job) error
	Parse_params([]byte) (Job, error)
}
