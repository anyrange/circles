package manager

import (
	"manager/core/balancer"
	"manager/core/task"
	"manager/test"
	"manager/util"
	"time"
)

type Manager struct {
	balancer      *balancer.Balancer
	tasks         map[string]*task.Task
	sync_interval time.Duration
}

func Create(b *balancer.Balancer, tasks_sync_interval time.Duration) *Manager {
	m := new(Manager)
	m.balancer = b
	m.sync_interval = tasks_sync_interval
	return m
}

func (m Manager) Sync_start() {
	go util.Set_interval(m.sync_tasks, m.sync_interval)
}

func (m Manager) sync_tasks() {
	active_tasks := test.Fetch_tasks_data()

	refreshed_tasks := map[string]struct{}{}

	for _, task_settings := range active_tasks {
		refreshed_tasks[task_settings.Name] = struct{}{}
		t, ok := m.tasks[task_settings.Name]

		exec_interval_duration := time.Duration(task_settings.Min_exec_interval) * time.Millisecond
		sync_interval_duration := time.Duration(task_settings.Min_sync_interval) * time.Millisecond

		if !ok {
			m.tasks[task_settings.Name] = task.Create(
				task_settings.Name,
				exec_interval_duration,
				sync_interval_duration,
			)
		} else {
			t.Update_settings(exec_interval_duration, sync_interval_duration)
		}
	}

	for task_name := range m.tasks {
		_, ok := refreshed_tasks[task_name]

		if !ok {
			delete(m.tasks, task_name)
		}
	}
}
