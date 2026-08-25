#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program.name('dashboard').description('CLI for the personal dashboard app (scaffold — no commands implemented yet)');

// Future commands, routed through the backend's REST API (see apiClient.ts):
//   dashboard tasks list
//   dashboard tasks complete <id>
//   dashboard journal add "<text>"

program.parse();
