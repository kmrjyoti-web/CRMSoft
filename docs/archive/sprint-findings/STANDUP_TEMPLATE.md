# Standup template — post every 4 hours

Post in the sprint Slack/Discord thread at Hour 4, 8, 12, 16, 20. Takes ~2 minutes to write.

```
🏃 Track [N] — [Your name] — Hour [X]

✅ Progress: [what you finished since last standup]
🚧 Current:  [what you're in the middle of]
🔴 Blockers: [what's stopping you — tag @Kumar if 30+ min stuck]
⏭️ Next 4h:  [your plan]
📦 Output:   [link to file(s) updated in /tmp/v2/ or sprint-findings/]
```

## Rules

- If you have no blockers, write `🔴 Blockers: none` — do not skip the line.
- If you fell asleep through a standup, post a make-up at your next wake time — the thread should have 5 checkpoints from each active track by Hour 20.
- One-liner "still going" is fine at Hour 16 if no significant change — but write something.

## Kumar's synthesis after each standup

Kumar reads all 5 track posts, then posts:

```
🧭 Sprint pulse — Hour [X]

Overall: [green / yellow / red]
On track: [tracks that are fine]
At risk:  [tracks needing help]
Decisions needed: [anything Kumar is waiting for input on]
Next sync: Hour [X+4]
```

If any track is yellow/red, Kumar pings that track owner directly — do not wait for the owner to self-escalate.

## Escalation shortcuts

| Situation                              | Action                                                |
| :------------------------------------- | :---------------------------------------------------- |
| Stuck 30+ min on technical blocker     | Ping Kumar in thread with `🔴 30min+`                 |
| Architecture decision needed           | Tag `@architecture` (or Kumar if no channel exists)   |
| Can't find info                        | Check `/tmp/` reports first → then ask                |
| Think scope is wrong for your track    | Flag immediately — do not quietly re-scope            |
| Notion access missing                  | Track 4 owner pings Kumar — blocks the whole sprint   |
