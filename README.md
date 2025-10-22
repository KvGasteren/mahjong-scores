# Mahjong Scores
Mahjong Scores is a webapp built to track scores for my group of mahjong
players.

## Usage
The app is currently hosted [here](https://mahjong-scores-git-main-koen-van-gasterens-projects.vercel.app/)

### New Session and keeping score
Sessions > New Session to start a new session

Per round (hand) insert the base points of each player, and the amount
of times this should be doubled. Doubling for East is automatically taken
into account, so should _not_ be included in this amount.

Indicate the winner of the round (the person that reached Mahjong)
And the player that played East position (for double paying and receiving)

Click Add Hand to add the scores to the session.

### Viewing past sessions
Under Sessions you see an overview of past sessions, click on the "title" to open
the session and view its details.

### Perusing Rules
Under Rules the scoring rules are shown

## Features under development
- persistant storage
- add photo to session
- add note to hand and show with clickable info icon and modal pop out
- <del>update scoring table</del>
- <del>mobile: table gets bigger when editing scores</del>