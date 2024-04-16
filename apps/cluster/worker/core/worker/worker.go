package worker

import (
	"fmt"
	"sync"
	"worker/core/task"
)

type Worker struct {
	available_tasks  map[string]task.Task // handler_name -> source_task
	task_in_progress *uint
	mutex            *sync.Mutex
}

func Create_worker() *Worker {
	w := new(Worker)
	w.available_tasks = map[string]task.Task{}
	w.task_in_progress = new(uint)
	w.mutex = new(sync.Mutex)
	return w
}

func (w Worker) Add_task(name string, task task.Task) error {
	_, rc := w.available_tasks[name]
	if rc {
		return fmt.Errorf("таска с таким именем уже существует")
	}
	w.available_tasks[name] = task
	return nil
}

func (w Worker) Get_task(name string) (task.Task, error) {
	task, rc := w.available_tasks[name]
	if !rc {
		return task, fmt.Errorf("таски с таким именем не существует")
	}
	return task, nil
}

func (w Worker) Execute(task task.Task, job task.Job) {
	w.mutex.Lock()
	*w.task_in_progress++
	w.mutex.Unlock()
	_ = task.Execute(job)
	w.mutex.Lock()
	*w.task_in_progress--
	w.mutex.Unlock()
	// defer rc
}

func (w Worker) Status() uint {
	w.mutex.Lock()
	defer w.mutex.Unlock()
	return *w.task_in_progress
}
