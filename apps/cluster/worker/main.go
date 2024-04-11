package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	worker "worker/core"
	"worker/tasks"
)

func default_handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Сервер работает!")
	_ = r
}

func execute_handler(w *worker.Worker) func(http.ResponseWriter, *http.Request) {
	handler := func(ans http.ResponseWriter, req *http.Request) {
		task_name := req.URL.Query().Get("name")
		if task_name == "" {
			fmt.Fprint(ans, "Плохой запрос: нет имени функции")
			return
		}
		task, err := w.Get_task(task_name)
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

func main() {
	// Создание обработчика
	a := worker.Create_worker()

	// Добавление возможных задач (инициализация обработчика)
	var err = a.Add_task("task1", tasks.Example_task{})
	if err != nil {
		log.Fatal(err)
	}

	// хендлеры
	http.HandleFunc("/", default_handler)
	http.HandleFunc("/execute", execute_handler(a))

	// Запуск сервера
	http.ListenAndServe(":80", nil)
}
