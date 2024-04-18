package manager

import (
	"manager/core/balancer"
)

type Manager struct {
	balancer *balancer.Balancer
}

func Create(b *balancer.Balancer) *Manager {
	m := new(Manager)
	m.balancer = b
	return m
}
