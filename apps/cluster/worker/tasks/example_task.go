package tasks

import (
	"fmt"
)

type task_args struct {
	Arg1 int
}

type Example_task struct {
}

func (t Example_task) Create() []Job {
	return []Job{{Id: "1", Args: task_args{Arg1: 1}}, {Id: "2", Args: task_args{Arg1: 5}}}
}

func (t Example_task) Execute(job Job) error {
	args, rc := job.Args.(task_args)
	if !rc {
		return fmt.Errorf("ошибка приведения типа аргументов Job")
	}
	_ = args
	fmt.Printf("Выполняю таску. Id параметров: %s\n", job.Id)
	return nil
}
