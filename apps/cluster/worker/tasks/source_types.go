package worker

type Args_type struct {
	Id   string
	Args any
}

type Task interface {
	Create() []Args_type
	Execute(Args_type)
}
