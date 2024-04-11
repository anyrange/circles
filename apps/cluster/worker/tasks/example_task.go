package worker

import "fmt"

type task_args struct {
	Arg1 int
}

type Task1 struct {
	name string
}

func (t Task1) Create() []Args_type {
	return []Args_type{{Id: "1", Args: task_args{Arg1: 1}}, {Id: "2", Args: task_args{Arg1: 5}}}
}

func (t Task1) Execute(args Args_type) {
	t_args, rc := args.Args.(task_args)
	if rc {
		panic("Ебнуло")
	}
	_ = t_args
	fmt.Printf("Выполняю таску. Ее имя: %s. Id параметров: %s", t.name, args.Id)
}
