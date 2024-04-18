package util

import "time"

func Set_interval(cb func(), interval time.Duration, destroyed chan bool) {
	for {
		select {
		case _, ok := <-destroyed:
			if !ok {
				return
			}
		default:
		}

		cb()
		time.Sleep(interval)
	}
}
