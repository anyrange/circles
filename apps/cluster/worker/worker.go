package worker

import "worker/tasks"

type Worker struct {
	available_tasks map[string]tasks.Task // handler_name -> source_task
}

func Create_worker() *Worker {
	w := new(Worker)
	w.available_tasks = map[string]tasks.Task{}
	return w
}

func (w Worker) Add_task(name string, task tasks.Task) {
	w.available_tasks[name] = task
}

func (w Worker) Get_task(name string) tasks.Task {
	task, rc := w.available_tasks[name]
	if !rc {
		panic("Нет такой таски!")
	}
	return task
}
