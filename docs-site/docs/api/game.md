# Game API

## Game Flow

### Standard Flow

This diagram shows the standard flow for creating and joining a game. The game record is stored in the games table with status "waiting" initially, then "active" when Player2 joins.

```mermaid
sequenceDiagram
    participant Host
    participant API as Game API
    participant WS as WebSocket Server
    participant DB as Database
    participant Player2

    Host->>API: POST /game
    API->>DB: Create game room
    DB-->>API: Return game ID
    API-->>Host: Response with game ID

    Host->>WS: Connect to WebSocket with game ID
    WS->>DB: Verify game ID exists
    DB-->>WS: Confirm game exists
    WS-->>Host: Connection established

    Note over Host,Player2: Host shares game ID with Player2

    Player2->>WS: Connect to WebSocket with game ID
    WS->>DB: Verify game ID exists
    DB-->>WS: Confirm game exists
    WS-->>Player2: Connection established
    
    WS->>Host: Notify Player2 joined
    WS->>Player2: Notify connected to game
```

### Edge Cases

#### Case 1: The game is full

When a third player attempts to join a game that already has the maximum number of players (2), the connection is rejected. The game remains in the games table with status "active".

```mermaid
sequenceDiagram
    participant Player3
    participant WS as WebSocket Server
    participant DB as Database

    Player3->>WS: Connect to WebSocket with game ID
    WS->>DB: Verify game ID exists and check player count
    DB-->>WS: Game exists but already has max players
    WS-->>Player3: Connection rejected (Game full)
```

#### Case 2: The Game doesn't exist

When a player attempts to join a game with an invalid ID, the connection is rejected. This prevents connections to non-existent game rooms.

```mermaid
sequenceDiagram
    participant Host
    participant Player2
    participant WS as WebSocket Server
    participant DB as Database

    Note over Host,Player2: Game in progress
    
    Host->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Host left)
    WS->>Player2: Notify Host disconnected
    
    Player2->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Player2 left)
    WS->>DB: Check if game is empty
    DB-->>WS: Confirm game is empty
    WS->>DB: Mark game as abandoned/completed
```

#### Case 3: The Game is abandoned

When all players disconnect from the game, the game is considered abandoned. The game data is moved from the games table to the game_history table with status "abandoned", freeing up the game ID for future use. Game statistics and player information are preserved in the history record.

```mermaid
sequenceDiagram
    participant Host
    participant Player2
    participant WS as WebSocket Server
    participant DB as Database

    Note over Host,Player2: Game in progress
    
    Host->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Host left)
    WS->>Player2: Notify Host disconnected
    
    Player2->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Player2 left)
    WS->>DB: Check if game is empty
    DB-->>WS: Confirm game is empty
    WS->>DB: Mark game as abandoned/completed
```

#### Case 4: The Game is completed

When the game is completed, the game data is moved from the games table to the game_history table with status "completed". The game statistics and player information are preserved in the history record.
