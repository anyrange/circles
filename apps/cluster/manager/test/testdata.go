package test

import "worker/core/task"

type Worker_data struct {
	Address      string
	Port         uint
	Max_workload uint
}

func Fetch_workers_data() []Worker_data {
	return []Worker_data{
		{
			Address:      "127.0.0.1",
			Port:         80,
			Max_workload: 100,
		},
	}
}

type Task_data struct {
	Name              string
	Min_sync_interval uint
	Min_exec_interval uint
}

func Fetch_tasks_data() []Task_data {
	return []Task_data{
		{
			Name:              "task1",
			Min_exec_interval: 10000,
			Min_sync_interval: 5000,
		},
	}
}

func Fetch_worker_state() uint {
	return 10
}

func Fetch_task_jobs() []task.Job {
	return []task.Job{{Id: "1", Args: "some_info"}, {Id: "2", Args: "other_info"}}
}
