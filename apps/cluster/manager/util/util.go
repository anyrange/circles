package util

import "time"

func Set_Interval(cb func(), interval time.Duration) {
	for {
		cb()
		time.Sleep(interval)
	}
}
