package main

import (
	"manager/config"
	"manager/core/balancer"
	"manager/core/manager"
	"time"
)

func main() {
	b := balancer.Create(config.BALANCER_SYNC_INTERVAL)
	m := manager.Create(b)

	go b.Sync_workers()

	time.Sleep(5000)
	_ = m
}
