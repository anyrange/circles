package main

import (
	"manager/core/manager"
	"time"
)

func main() {
	// m := Manager{}
	b := manager.Create_balancer(1)
	go b.Sync_workers()
	time.Sleep(5 * time.Second)
	// _ = m
}
