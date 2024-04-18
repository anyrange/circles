package worker

type Worker struct {
	address          string
	port             uint
	current_workload uint
	max_workload     uint
}

func (w Worker) Get_address() string {
	return w.address
}

func (w Worker) Get_port() uint {
	return w.port
}

func (w Worker) Get_current_workload() uint {
	return w.current_workload
}

func (w Worker) Get_max_workload() uint {
	return w.max_workload
}

func (w *Worker) Set_max_workload(max_workload uint) {
	w.max_workload = max_workload
}

func Create(address string, port uint, max_workload uint) *Worker {
	w := new(Worker)
	w.address = address
	w.port = port
	w.max_workload = max_workload
	return w
}
