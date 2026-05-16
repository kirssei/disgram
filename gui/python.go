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

	os.WriteFile("/tmp/disgram_debug.txt", []byte("exe: "+exe+"\n"), 0644)

	resolved, _ := filepath.EvalSymlinks(exe)
	os.WriteFile("/tmp/disgram_debug.txt",
		[]byte("exe: "+exe+"\nresolved: "+resolved+"\n"), 0644)

	dir := filepath.Dir(resolved)
	if runtime.GOOS == "darwin" {
		if strings.Contains(dir, ".app/Contents/MacOS") {
			dir = filepath.Join(dir, "../../..")
		}
	}

	result := filepath.Join(dir, "_internal")
	os.WriteFile("/tmp/disgram_debug.txt",
		[]byte("exe: "+exe+"\nresolved: "+resolved+"\nresult: "+result+"\n"), 0644)

	return result
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
