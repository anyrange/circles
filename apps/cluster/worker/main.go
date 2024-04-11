package main

import (
	"fmt"
	"net/http"
	"sync"
	worker "worker/core"
	"worker/tasks"
)

func main() {
	waiter := new(sync.WaitGroup)
	a := worker.Create_worker(waiter)
	a.Add_task("task1", tasks.Example_task{})
	task := a.Get_task("task1")
	jobs := task.Create()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		waiter.Add(1)
		go a.Execute(task, jobs[0])
		fmt.Println(a.Status())
	})
	http.ListenAndServe(":80", nil)
}
