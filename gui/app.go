package main

import (
	"context"
	"os/exec"
	"sync"
)

type App struct {
	ctx         context.Context
	pythonProc  *exec.Cmd
	isRunning   bool
	internalDir string
	logBuffer   []string
	logMu       sync.Mutex
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.internalDir = findInternalDir()
}
