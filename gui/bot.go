package main
import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)
func (a *App) SaveAndRun(input ConfigInput) string {
	if a.isRunning {
		return "error:Бот уже запущен. Сначала останови его."
	}
	pythonExe, err := a.getPythonExe()
	if err != nil {
		return "error:" + err.Error()
	}
	configPath := filepath.Join(a.internalDir, "config.yaml")
	if err := saveConfig(input, configPath); err != nil {
		return "error:Не удалось сохранить конфиг: " + err.Error()
	}
	scriptPath := filepath.Join(a.internalDir, "disgram.py")
	if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
		return "error:disgram.py не найден в _internal/"
	}

	sitePackages := filepath.Join(a.internalDir, "site-packages")
	pythonPath := a.internalDir + string(os.PathListSeparator) + sitePackages

	// ВРЕМЕННЫЙ DEBUG — удалить после диагностики Windows PYTHONPATH
	a.logMu.Lock()
	a.logBuffer = append(a.logBuffer,
		"out:DEBUG internalDir="+a.internalDir,
		"out:DEBUG pythonPath="+pythonPath,
		"out:DEBUG pythonExe="+pythonExe,
		"out:DEBUG scriptPath="+scriptPath,
	)
	a.logMu.Unlock()

	a.pythonProc = exec.Command(pythonExe, scriptPath)
	a.pythonProc.Dir = a.internalDir
	a.pythonProc.Env = append(os.Environ(),
		"PYTHONPATH="+pythonPath,
		"PYTHONNOUSERSITE=1",
		"DISGRAM_CONFIG="+configPath,
		"PYTHONUNBUFFERED=1",
	)
	setProcAttr(a.pythonProc)
	stdout, err := a.pythonProc.StdoutPipe()
	if err != nil {
		return "error:Не удалось создать stdout pipe: " + err.Error()
	}
	stderr, err := a.pythonProc.StderrPipe()
	if err != nil {
		return "error:Не удалось создать stderr pipe: " + err.Error()
	}
	a.logMu.Lock()
	a.logBuffer = append(a.logBuffer, "out:--- запуск бота ---")
	a.logMu.Unlock()
	if err := a.pythonProc.Start(); err != nil {
		return "error:Не удалось запустить бота: " + err.Error()
	}
	a.isRunning = true
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			a.appendLog("out:" + scanner.Text())
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			a.appendLog("err:" + scanner.Text())
		}
	}()
	go func() {
		a.pythonProc.Wait()
		a.isRunning = false
		a.appendLog("out:--- бот остановлен ---")
	}()
	return fmt.Sprintf("ok:Бот запущен (PID %d)", a.pythonProc.Process.Pid)
}
func (a *App) appendLog(line string) {
	a.logMu.Lock()
	defer a.logMu.Unlock()
	a.logBuffer = append(a.logBuffer, line)
	if len(a.logBuffer) > 500 {
		a.logBuffer = a.logBuffer[len(a.logBuffer)-500:]
	}
}
func (a *App) StopBot() string {
	if !a.isRunning || a.pythonProc == nil {
		return "error:Бот не запущен"
	}
	if err := a.pythonProc.Process.Kill(); err != nil {
		return "error:Не удалось остановить: " + err.Error()
	}
	a.isRunning = false
	return "ok:Бот остановлен"
}
func (a *App) IsRunning() bool {
	return a.isRunning
}
func (a *App) GetLogs(offset int) []string {
	a.logMu.Lock()
	defer a.logMu.Unlock()
	if offset >= len(a.logBuffer) {
		return []string{}
	}
	return a.logBuffer[offset:]
}
