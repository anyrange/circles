package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"worker/core/task"
	"worker/core/worker"
	"worker/tasks"
)

func default_handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Сервер работает!")
	_ = r
}

func get_task(url *url.URL, w *worker.Worker) (task.Task, error) {
	task_name := url.Query().Get("name")
	var task task.Task
	var err error
	if task_name == "" {
		err = fmt.Errorf("плохой запрос: нет имени функции")
		return task, err
	}
	return w.Get_task(task_name)
}

func execute_handler(w *worker.Worker) func(http.ResponseWriter, *http.Request) {
	handler := func(ans http.ResponseWriter, req *http.Request) {
		task, err := get_task(req.URL, w)
		if err != nil {
			fmt.Fprint(ans, err)
			return
		}
		bodyBytes, err := io.ReadAll(req.Body)
		if err != nil {
			fmt.Fprint(ans, err)
			return
		}
		job, err := task.Parse_params(bodyBytes)
		if err != nil {
			fmt.Fprint(ans, err)
			return
		}
		task.Execute(job)
	}
	return handler
}

func status_handler(w *worker.Worker) func(http.ResponseWriter, *http.Request) {
	handler := func(ans http.ResponseWriter, req *http.Request) {
		fmt.Fprint(ans, w.Status())
	}
	return handler
}

func jobs_handler(w *worker.Worker) func(http.ResponseWriter, *http.Request) {
	handler := func(ans http.ResponseWriter, req *http.Request) {
		task, err := get_task(req.URL, w)
		if err != nil {
			fmt.Fprint(ans, err)
			return
		}
		jobs := task.Create()
		fmt.Fprint(ans, jobs)
	}
	return handler
}

func main() {
	// Создание обработчика
	a := worker.Create_worker()

	// Добавление возможных задач (инициализация обработчика)
	var err = a.Add_task("task1", tasks.Example_task{})
	if err != nil {
		log.Fatal(err)
	}

	// Хендлеры
	http.HandleFunc("/", default_handler)
	http.HandleFunc("/execute", execute_handler(a))
	http.HandleFunc("/status", status_handler(a))
	http.HandleFunc("/jobs", jobs_handler(a))

	// Запуск сервера
	http.ListenAndServe(":80", nil)
}
