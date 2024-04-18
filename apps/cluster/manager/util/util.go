package util

import "time"

func Set_interval(cb func(), interval time.Duration) {
	for {
		cb()
		time.Sleep(interval)
	}
}
