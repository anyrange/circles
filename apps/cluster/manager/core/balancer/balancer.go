package balancer

import (
	"fmt"
	"manager/core/worker"
	"manager/test"
	"manager/util"
	"time"
)

type Balancer struct {
	workers       map[string]*worker.Worker
	sync_interval time.Duration
}

func Create(sync_interval time.Duration) *Balancer {
	b := new(Balancer)
	b.workers = map[string]*worker.Worker{}
	b.sync_interval = sync_interval
	return b
}

func (b Balancer) Sync_start() {
	destroyed := make(chan bool)
	go util.Set_interval(b.sync_workers, b.sync_interval, destroyed)
}

func (b Balancer) Select() *worker.Worker {
	var min_workload uint = ^uint(0)
	var available_worker *worker.Worker = nil

	for _, w := range b.workers {
		current_workload := w.Get_current_workload()
		max_workload := w.Get_max_workload()

		if min_workload > current_workload && current_workload < max_workload {
			min_workload = current_workload
			available_worker = w
		}
	}

	return available_worker
}

func (b Balancer) sync_workers() {
	active_workers := test.Fetch_workers_data()

	refreshed_workers := map[string]struct{}{}

	for _, worker_settings := range active_workers {
		worker_hash := fmt.Sprintf("%s:%d", worker_settings.Address, worker_settings.Port)

		refreshed_workers[worker_hash] = struct{}{}
		w, ok := b.workers[worker_hash]

		if !ok {
			b.workers[worker_hash] = worker.Create(
				worker_settings.Address,
				worker_settings.Port,
				worker_settings.Max_workload,
			)
			b.workers[worker_hash].Sync_start()
		} else {
			w.Update_settings(worker_settings.Max_workload)
		}
	}

	for worker_hash := range b.workers {
		_, ok := refreshed_workers[worker_hash]

		if !ok {
			b.workers[worker_hash].Destroy()
			delete(b.workers, worker_hash)
		}
	}
}
