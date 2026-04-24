#!/usr/bin/env node
/**
 * notion-logger.js — Lightweight Notion API logger for PM CLI
 * Called by scripts/lib/notion-log.sh when NOTION_TOKEN is set.
 *
 * Usage: node scripts/lib/notion-logger.js <action> <tag> <status> [details]
 *
 * Note: Chat-Claude MCP is the PRIMARY Notion logger for sprint-level entries.
 * This script handles automated operational logs (deploy, backup, env-sync, etc.)
 */

const action  = process.argv[2] || 'unknown';
const tag     = process.argv[3] || 'project';
const status  = process.argv[4] || 'info';
const details = process.argv[5] || '';

async function log() {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.log('NOTION_TOKEN not set — local log only');
    return;
  }

  // Load config for database IDs
  let config;
  try {
    config = require('../../.claude/config.json');
  } catch {
    console.log('Could not load .claude/config.json — skipping Notion log');
    return;
  }

  const dbId = config?.notion?.promptExecutionLogDbId;
  if (!dbId) {
    console.log('notion.promptExecutionLogDbId not in config.json — skipping');
    return;
  }

  // Use fetch (Node 18+) or @notionhq/client if installed
  try {
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: token });

    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: {
          title: [{ text: { content: `[${tag.toUpperCase()}] ${action}` } }]
        },
        Status: {
          select: { name: status === 'success' ? 'Done' : status === 'failure' ? 'Failed' : 'In Progress' }
        },
        Tags: {
          multi_select: [{ name: tag }]
        },
        Details: {
          rich_text: details ? [{ text: { content: details } }] : []
        },
        'Logged At': {
          date: { start: new Date().toISOString() }
        },
        Source: {
          select: { name: 'pm-cli' }
        }
      }
    });
    console.log(`✅ Notion logged: [${tag}] ${action} (${status})`);
  } catch (err) {
    // Non-fatal: @notionhq/client may not be installed
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('📋 @notionhq/client not installed — run: pnpm add @notionhq/client');
    } else {
      console.log(`⚠️  Notion API error: ${err.message}`);
    }
    // Exit 0 — never block the calling script
    process.exit(0);
  }
}

log().catch(err => {
  // Catch all unhandled errors — non-fatal
  console.log(`⚠️  Notion logger error (non-fatal): ${err.message}`);
  process.exit(0);
});
