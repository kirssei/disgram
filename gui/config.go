package main

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Telegram struct {
		Token     string `yaml:"token"`
		ChannelID int64  `yaml:"channel_id"`
	} `yaml:"telegram"`
	Discord struct {
		Token      string `yaml:"token"`
		ChannelID  int64  `yaml:"channel_id"`
		UseThread  bool   `yaml:"use_thread"`
		ThreadName string `yaml:"thread_name"`
		UseRole    bool   `yaml:"use_role"`
		RolesPing  string `yaml:"roles_ping"`
	} `yaml:"discord"`
	EmojiMap map[string]string `yaml:"emoji_map"`
	Filters  struct {
		StopWords []string `yaml:"stop_words"`
	} `yaml:"filters"`
}

type ConfigInput struct {
	TelegramToken     string `json:"telegramToken"`
	TelegramChannelID string `json:"telegramChannelId"`
	DiscordToken      string `json:"discordToken"`
	DiscordChannelID  string `json:"discordChannelId"`
	UseThread         bool   `json:"useThread"`
	ThreadName        string `json:"threadName"`
	UseRole           bool   `json:"useRole"`
	RolesPing         string `json:"rolesPing"`
	EmojiMapRaw       string `json:"emojiMapRaw"`
	StopWordsRaw      string `json:"stopWordsRaw"`
}

func (a *App) LoadConfig() *ConfigInput {
	configPath := filepath.Join(a.internalDir, "config.yaml")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil
	}

	var emojiLines []string
	for k, v := range cfg.EmojiMap {
		emojiLines = append(emojiLines, k+":"+v)
	}

	return &ConfigInput{
		TelegramToken:     cfg.Telegram.Token,
		TelegramChannelID: strconv.FormatInt(cfg.Telegram.ChannelID, 10),
		DiscordToken:      cfg.Discord.Token,
		DiscordChannelID:  strconv.FormatInt(cfg.Discord.ChannelID, 10),
		UseThread:         cfg.Discord.UseThread,
		ThreadName:        cfg.Discord.ThreadName,
		UseRole:           cfg.Discord.UseRole,
		RolesPing:         cfg.Discord.RolesPing,
		EmojiMapRaw:       strings.Join(emojiLines, "\n"),
		StopWordsRaw:      strings.Join(cfg.Filters.StopWords, ", "),
	}
}

func saveConfig(input ConfigInput, path string) error {
	emojiMap := map[string]string{}

	for _, line := range strings.Split(strings.TrimSpace(input.EmojiMapRaw), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) == 2 {
			emojiMap[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
		}
	}

	var stopWords []string
	for _, w := range strings.Split(input.StopWordsRaw, ",") {
		w = strings.TrimSpace(strings.ToLower(w))
		if w != "" {
			stopWords = append(stopWords, w)
		}
	}

	telegramID, err := strconv.ParseInt(input.TelegramChannelID, 10, 64)
	if err != nil {
		return err
	}

	discordID, err := strconv.ParseInt(input.DiscordChannelID, 10, 64)
	if err != nil {
		return err
	}

	cfg := Config{}

	cfg.Telegram.Token = input.TelegramToken
	cfg.Telegram.ChannelID = telegramID

	cfg.Discord.Token = input.DiscordToken
	cfg.Discord.ChannelID = discordID
	cfg.Discord.UseThread = input.UseThread
	cfg.Discord.ThreadName = input.ThreadName
	cfg.Discord.UseRole = input.UseRole
	cfg.Discord.RolesPing = input.RolesPing

	cfg.EmojiMap = emojiMap
	cfg.Filters.StopWords = stopWords

	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
