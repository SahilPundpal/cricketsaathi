# Demo walkthrough (3 to 4 minutes)

## Opening (30 seconds)

"A scoreboard tells fans what the score is, but not what the story is. Someone who looks away has to rebuild the innings, and a newer fan may not understand the terms. CricketSaathi focuses on those two moments."

## Catch Me Up since you last looked (60 seconds)

1. Point to the score and chase numbers.
2. Click **Look away for 2 overs**. The match moves on and the chip shows how many balls you missed.
3. Click **Catch me up**. The recap covers exactly those balls: what you missed, where the match stands, what to watch next.
4. Switch between Hinglish, Hindi and English and refresh.

## Hinglish Co-watcher (60 seconds)

Ask `Free hit kya hota hai?`, then `Why is the chase difficult now?` to show the answer uses the current match situation.

## Engineering decisions (60 seconds)

- The match engine owns scores and event history; the model only explains them.
- Each visitor has an isolated match (session id), so a shared demo link is safe to click around.
- The Groq key stays on the server; a clearly labelled fallback keeps the demo working if the AI call fails.
- The same API shape can later be backed by a licensed cricket data provider.

## Be transparent

The match is simulated, with fictional teams and players. Describe the data-provider adapter as the next step. Do not claim a connection to Dream11 or a live score provider.
