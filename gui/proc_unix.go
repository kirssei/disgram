//go:build !windows

package main

import "os/exec"

func setProcAttr(cmd *exec.Cmd) {}
