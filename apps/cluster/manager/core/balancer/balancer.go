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

func (b Balancer) Sync_workers() {
	util.Set_Interval(b.sync_workers_handler, b.sync_interval)
}

func (b Balancer) Select() *worker.Worker {
	var min_workload uint = ^uint(0)
	var res *worker.Worker = nil

	for _, w := range b.workers {
		current_workload := w.Get_current_workload()
		max_workload := w.Get_max_workload()

		if min_workload > current_workload && current_workload < max_workload {
			min_workload = current_workload
			res = w
		}
	}

	return res
}

func (b Balancer) sync_workers_handler() {
	active_workers := test.Fetch_worker_data()

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
		} else {
			w.Set_max_workload(worker_settings.Max_workload)
		}
	}

	for _, w := range b.workers {
		worker_hash := fmt.Sprintf("%s:%d", w.Get_address(), w.Get_port())

		_, ok := refreshed_workers[worker_hash]

		if !ok {
			delete(b.workers, worker_hash)
		}
	}
}
