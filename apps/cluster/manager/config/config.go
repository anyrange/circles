package config

import "time"

const (
	BALANCER_SYNC_INTERVAL = 5 * time.Minute
	WORKERS_SYNC_INTERVAL  = 5 * time.Second
	MANAGER_SYNC_INTERVAL  = 5 * time.Second
)
