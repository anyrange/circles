package task

import (
	"manager/test"
	"manager/util"
	"time"
)

type Task struct {
	name          string
	exec_interval time.Duration
	sync_interval time.Duration
	destroyed     chan bool
	jobs          map[string]any

	// max_workload  uint
}

func Create(name string, exec_interval time.Duration, sync_interval time.Duration) *Task {
	t := new(Task)
	t.name = name
	t.exec_interval = exec_interval
	t.sync_interval = sync_interval
	t.destroyed = make(chan bool)
	return t
}

func (t *Task) Update_settings(exec_interval time.Duration, sync_interval time.Duration) {
	t.exec_interval = exec_interval
	t.sync_interval = sync_interval
}

func (t Task) Sync_start() {
	go util.Set_interval(t.sync_jobs, t.sync_interval, t.destroyed)
}

func (t Task) Destroy() {
	close(t.destroyed)
}

func (t *Task) sync_jobs() {
	active_jobs := test.Fetch_task_jobs()
	refreshed_jobs := map[string]struct{}{}

	for _, job := range active_jobs {
		refreshed_jobs[job.Id] = struct{}{}
		t.jobs[job.Id] = job.Args
	}

	for job_id := range t.jobs {
		_, ok := refreshed_jobs[job_id]

		if !ok {
			delete(t.jobs, job_id)
		}
	}
}
