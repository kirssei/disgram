package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

func findInternalDir() string {
	exe, err := os.Executable()
	if err != nil {
		return "_internal"
	}

	dir := filepath.Dir(exe)

	if runtime.GOOS == "darwin" {
		if strings.Contains(dir, ".app/Contents/MacOS") {
			inBundle := filepath.Join(dir, "../_internal")
			inBundle = filepath.Clean(inBundle)
			if _, err := os.Stat(inBundle); err == nil {
				return inBundle
			}
			dir = filepath.Join(dir, "../../..")
		}
	}

	return filepath.Join(dir, "_internal")
}

func (a *App) getPythonExe() (string, error) {
	var pythonExe string
	switch runtime.GOOS {
	case "windows":
		pythonExe = filepath.Join(a.internalDir, "python", "python.exe")
	default:
		pythonExe = filepath.Join(a.internalDir, "python", "bin", "python3")
	}
	if _, err := os.Stat(pythonExe); os.IsNotExist(err) {
		return "", fmt.Errorf(
			"Python не найден по пути %s\n"+
				"Убедись что папка _internal/ находится рядом с приложением",
			pythonExe,
		)
	}
	return pythonExe, nil
}
