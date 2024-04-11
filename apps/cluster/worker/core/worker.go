package worker

import (
	"sync"
	"worker/tasks"
)

type Worker struct {
	available_tasks  map[string]tasks.Task // handler_name -> source_task
	waiter           *sync.WaitGroup
	task_in_progress *uint
	mutex            *sync.Mutex
}

func Create_worker(waiter *sync.WaitGroup) *Worker {
	w := new(Worker)
	w.available_tasks = map[string]tasks.Task{}
	w.waiter = waiter
	w.task_in_progress = new(uint)
	w.mutex = new(sync.Mutex)
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

func (w Worker) Execute(task tasks.Task, job tasks.Job) {
	w.mutex.Lock()
	*w.task_in_progress++
	w.mutex.Unlock()
	_ = task.Execute(job)
	w.mutex.Lock()
	*w.task_in_progress--
	w.mutex.Unlock()
	w.waiter.Done()
	// defer rc
}

func (w Worker) Status() uint {
	w.mutex.Lock()
	defer w.mutex.Unlock()
	return *w.task_in_progress
}
