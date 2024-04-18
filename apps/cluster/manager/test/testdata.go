package test

type Worker_data struct {
	Address      string
	Port         uint
	Max_workload uint
}

func Fetch_worker_data() []Worker_data {
	return []Worker_data{
		{
			Address:      "127.0.0.1",
			Port:         8080,
			Max_workload: 100,
		},
	}
}
