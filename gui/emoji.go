package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/yaml.v3"
)

type DiscordEmoji struct {
	ID       string `yaml:"id" json:"id"`
	Name     string `yaml:"name" json:"name"`
	Animated bool   `yaml:"animated" json:"animated"`
	URL      string `yaml:"url" json:"url"`
}

type TelegramEmoji struct {
	ID    string `yaml:"id" json:"id"`
	Emoji string `yaml:"emoji" json:"emoji"`
	Mime  string `yaml:"mime" json:"mime"`
	Data  string `yaml:"data" json:"data"` // base64
}

type EmojiDump struct {
	Discord  []DiscordEmoji  `yaml:"discord_emoji" json:"discord"`
	Telegram []TelegramEmoji `yaml:"telegram_emoji" json:"telegram"`
}

// DumpEmoji сохраняет конфиг и запускает `python disgram.py dump_emoji`
func (a *App) DumpEmoji(input ConfigInput) string {
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

	cmd := exec.Command(pythonExe, scriptPath, "dump_emoji")
	cmd.Dir = a.internalDir
	cmd.Env = append(os.Environ(),
		"PYTHONPATH="+pythonPath,
		"PYTHONNOUSERSITE=1",
		"DISGRAM_CONFIG="+configPath,
		"PYTHONUNBUFFERED=1",
	)
	setProcAttr(cmd)

	a.appendLog("out:--- сгрузка эмодзи ---")
	output, err := cmd.CombinedOutput()
	for _, line := range strings.Split(strings.TrimRight(string(output), "\n"), "\n") {
		if line != "" {
			a.appendLog("out:" + line)
		}
	}
	if err != nil {
		a.appendLog("err:сгрузка завершилась с ошибкой: " + err.Error())
		return "error:Сгрузка завершилась с ошибкой, подробности в логах"
	}
	a.appendLog("out:--- эмодзи сгружены ---")
	return "ok:Эмодзи сгружены"
}

// LoadEmojiDump читает emoji_dump.yaml
func (a *App) LoadEmojiDump() (*EmojiDump, error) {
	data, err := os.ReadFile(filepath.Join(a.internalDir, "emoji_dump.yaml"))
	if err != nil {
		return nil, err
	}

	var file struct {
		Dump EmojiDump `yaml:"emoji_dump"`
	}
	if err := yaml.Unmarshal(data, &file); err != nil {
		return nil, err
	}
	return &file.Dump, nil
}

// SaveEmojiMapping открывает диалог сохранения и пишет JSON в файл
func (a *App) SaveEmojiMapping(content string) string {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Сохранить соответствия эмодзи",
		DefaultFilename: "emoji_map.json",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil {
		return "error:" + err.Error()
	}
	if path == "" {
		return "" // пользователь закрыл диалог
	}
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return "error:Не удалось сохранить файл: " + err.Error()
	}
	return "ok:Сохранено: " + path
}
