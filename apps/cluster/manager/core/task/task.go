package task

import "time"

type Task struct {
	name          string
	exec_interval time.Duration
	sync_interval time.Duration
	// max_workload  uint
}

func Create(name string, exec_interval time.Duration, sync_interval time.Duration) *Task {
	t := new(Task)
	t.name = name
	t.exec_interval = exec_interval
	t.sync_interval = sync_interval
	return t
}

func (t *Task) Update_settings(exec_interval time.Duration, sync_interval time.Duration) {
	t.exec_interval = exec_interval
	t.sync_interval = sync_interval
}
