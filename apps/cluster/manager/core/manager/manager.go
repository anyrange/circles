package manager

import (
	"fmt"
	"manager/core/worker"
	"time"
)

type Manager struct {
}

type Balancer struct {
	Workers       map[string]*worker.Worker
	sync_interval uint
	// sync_timer    time.Ticker
}

func Create_balancer(sync_interval uint) *Balancer {
	b := new(Balancer)
	b.Workers = map[string]*worker.Worker{}
	b.sync_interval = sync_interval
	// b.sync_timer = *time.NewTicker(time.Second) // * sync_interval
	return b
}

func (b Balancer) Sync_workers() {
	for {
		func() {
			fmt.Println("blia")
		}()
		time.Sleep(time.Second)
	}
}

func (b Balancer) Select() *worker.Worker {
	var min_workload uint = ^uint(0)
	var res *worker.Worker = nil
	for _, val := range b.Workers {
		if min_workload > val.Current_workload {
			min_workload = val.Current_workload
			res = val
		}
	}
	return res
}
