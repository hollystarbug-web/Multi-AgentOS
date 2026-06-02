#!/usr/bin/env tsx
/**
 * config:show — print the active config (user merged with defaults).
 *
 *   npm run config:show
 */

import { loadConfig, configPath, hasUserConfig } from '../lib/config'
import yaml from 'js-yaml'

const cfg = loadConfig()
console.log(yaml.dump(cfg, { lineWidth: 120 }))
console.log('---')
console.log(`Source: ${hasUserConfig() ? configPath() : '(using built-in defaults)'}`)
