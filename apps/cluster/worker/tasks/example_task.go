package worker

import "fmt"

type task_args struct {
	Arg1 int
}

type Example_task struct {
	name string
}

func (t Example_task) Create() []Job {
	return []Job{{Id: "1", Args: task_args{Arg1: 1}}, {Id: "2", Args: task_args{Arg1: 5}}}
}

func (t Example_task) Execute(job Job) {
	args, rc := job.Args.(task_args)
	if rc {
		panic("Ебнуло")
	}
	_ = args
	fmt.Printf("Выполняю таску. Ее имя: %s. Id параметров: %s", t.name, job.Id)
}
