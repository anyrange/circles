package main

import (
	"fmt"
	"time"
	worker "worker/core"
	"worker/tasks"
)

func main() {
	a := worker.Create_worker()
	a.Add_task("task1", tasks.Example_task{})
	task := a.Get_task("task1")
	jobs := task.Create()
	for i := range jobs {
		go task.Execute(jobs[i])
	}
	time.Sleep(2 * time.Second)
	fmt.Println("Есссс")
}
