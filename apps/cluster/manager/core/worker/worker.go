package worker

import (
	"manager/test"
	"manager/util"
	"time"
)

type Worker struct {
	address          string
	port             uint
	current_workload uint
	max_workload     uint
	sync_interval    time.Duration
	destroyed        chan bool
}

func Create(address string, port uint, max_workload uint) *Worker {
	w := new(Worker)
	w.address = address
	w.port = port
	w.max_workload = max_workload
	w.destroyed = make(chan bool)
	return w
}

func (w Worker) Get_current_workload() uint {
	return w.current_workload
}

func (w Worker) Get_max_workload() uint {
	return w.max_workload
}

func (w *Worker) Update_settings(max_workload uint) {
	w.max_workload = max_workload
}

func (w Worker) Sync_start() {
	go util.Set_interval(w.sync_state, w.sync_interval, w.destroyed)
}

func (w Worker) Destroy() {
	close(w.destroyed)
}

func (w *Worker) sync_state() {
	w.current_workload = test.Fetch_worker_state()
}
