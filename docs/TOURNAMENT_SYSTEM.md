# Pokemon Tournament System

## Overview

The Pokemon Tournament System enables players to compete in bracket-style tournaments against AI opponents, providing an engaging group battle experience beyond single battles.

## Features

### Tournament Creation
- **Multiple Tournament Sizes**: Create tournaments with 4, 8, or 16 participants
- **Tournament Naming**: Custom names for tracking your championship runs
- **Team Selection**: Choose from your saved teams to compete
- **Format Support**: Currently supports Single Elimination (Double Elimination and Round Robin planned)

### Tournament Progression
- **Visual Bracket Display**: See the full tournament structure with all matchups
- **Round Tracking**: Clear indication of current round and progress through the bracket
- **AI Simulation**: Non-player matches are automatically simulated based on team strength
- **Real-time Updates**: Bracket updates as matches complete

### Battle Integration
- **Seamless Battle Flow**: Tournament battles use the existing battle system
- **Match Context**: Battle screen shows tournament information
- **Automatic Advancement**: Winners automatically advance to the next round
- **Tournament-specific UI**: Special indicators for tournament matches

### Statistics & History
- **Tournament Stats**: Track wins, total tournaments, and win rate
- **Persistent History**: All tournament results are saved
- **Champion Tracking**: Know when you've won a tournament

## User Flow

### 1. Creating a Tournament

1. Navigate to Team Builder
2. Build and save a team (minimum 1 Pokemon)
3. Tap the 🏆 Tournament button
4. Enter tournament details:
   - Tournament name
   - Number of participants (4, 8, or 16)
   - Select your team
5. Tap "Create Tournament"

### 2. Tournament Bracket

After creation, you'll see:
- Full bracket visualization
- Your position in the bracket
- AI opponent names and teams
- Round indicators
- Match status (pending, in progress, completed)

Tap "Start Tournament" to begin competing.

### 3. Battle Phase

When it's your turn to battle:
- Match card shows "Your Turn!" indicator
- Tap the match to enter battle
- Complete battle using standard controls
- Winner automatically advances

AI vs AI matches are simulated instantly.

### 4. Tournament Completion

When you reach the finals:
- Complete the championship match
- View results screen
- Champion is announced
- Stats are updated
- Return to lobby for another tournament

## Technical Architecture

### Components

#### TournamentLobbyScreen
- Tournament creation interface
- Team selection
- Statistics display
- Tournament history access

#### TournamentBracketScreen
- Bracket visualization
- Round progression tracking
- Match status indicators
- Navigation to battles

#### TournamentBattleScreen
- Battle interface with tournament context
- Integration with battle store
- Automatic tournament advancement
- Tournament-specific UI elements

### State Management

#### TournamentStore (`src/store/tournamentStore.ts`)

Key state:
- `currentTournament`: Active tournament data
- `tournamentHistory`: Completed tournaments
- `isProcessing`: Operation status

Key actions:
- `createTournament()`: Initialize new tournament
- `startTournament()`: Begin bracket progression
- `advanceTournament()`: Process match results
- `cancelTournament()`: Cancel active tournament
- `getTournamentStats()`: Retrieve statistics

### Types

#### Tournament Types (`src/types/tournament.ts`)

```typescript
- Tournament: Complete tournament state
- TournamentParticipant: Player or AI participant
- TournamentMatch: Individual match data
- TournamentRound: Round structure
- TournamentFormat: SINGLE_ELIMINATION | DOUBLE_ELIMINATION | ROUND_ROBIN
- TournamentStatus: REGISTRATION | IN_PROGRESS | COMPLETED | CANCELLED
```

### AI Simulation

AI vs AI matches are resolved using:
- Team total stat calculations (80% weight)
- Randomness factor (20% weight)
- Winner determination based on combined score

This ensures:
- Stronger teams usually win
- Occasional upsets create excitement
- Fast simulation for non-player matches

## Integration Points

### Team Builder
- Added 🏆 Tournament button
- Validates team is saved before entry
- Direct navigation to tournament lobby

### Navigation
- New tournament routes in AppNavigator
- Proper stack navigation flow
- Back navigation handling

### Battle System
- Tournament battle extends base battle
- Uses existing battle mechanics
- Adds tournament context and UI

## Future Enhancements

### Planned Features
1. **Double Elimination Format**: Losers bracket support
2. **Round Robin Format**: Every team plays every team
3. **Tournament History View**: Browse past tournaments
4. **Leaderboards**: Global or local rankings
5. **Tournament Rewards**: Badges, titles, or special items
6. **Custom Rulesets**: Level caps, type restrictions
7. **Multiplayer Tournaments**: Real player participation
8. **Spectator Mode**: Watch AI tournaments unfold

### Technical Improvements
1. Better bracket visualization for large tournaments
2. Tournament replay system
3. Advanced AI difficulty levels
4. Tournament save/resume functionality
5. Performance optimizations for large participant counts

## Testing

Tests cover:
- Tournament creation with various sizes
- Bracket generation correctness
- AI simulation logic
- State management
- Tournament progression
- Statistics calculation

Run tests:
```bash
npm test -- tournamentStore.test
```

## Accessibility

- All tournament screens support screen readers
- Clear button labels and hints
- Visual indicators for tournament state
- Proper focus management

## Performance Considerations

- AI simulations run synchronously but complete quickly
- Large tournaments (16+ participants) may take a moment to generate
- Bracket rendering optimized for various screen sizes
- State persistence uses AsyncStorage for reliability

## Known Limitations

1. Only Single Elimination currently implemented
2. Tournament can't be paused mid-match
3. No undo/redo for tournament progression
4. Limited to pre-defined participant counts
5. AI simulation is deterministic per match

## Contributing

When extending the tournament system:
1. Maintain backwards compatibility with saved tournaments
2. Add tests for new tournament formats
3. Update this documentation
4. Consider mobile performance
5. Ensure accessibility standards

## Credits

Inspired by classic Pokemon game tournaments and community feedback requesting group battle features.
