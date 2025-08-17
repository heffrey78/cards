# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a card game engine built with Svelte5 and TypeScript. The project emphasizes:
- Planning-first development using lifecycle-mcp
- BDD patterns and user stories
- Test-driven development with verified code
- Vertical slice architecture
- Small, verified commits

## Development Commands

```bash
# Frontend development (from project root)
cd frontend

# Project setup 
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run tests with UI
npm test:ui

# Type checking
npm run check

# Watch mode type checking
npm run check:watch
```

## Architecture Guidelines

### Core Structure
- `/src/lib/` - Reusable game engine components
- `/src/lib/cards/` - Card system (Card, Deck, Hand classes)
- `/src/lib/game/` - Game state management and rules engine
- `/src/lib/players/` - Player management and AI
- `/src/lib/ui/` - Svelte components for game interface
- `/src/routes/` - SvelteKit pages and game views
- `/tests/` - Test files mirroring src structure

### Development Workflow
1. Use lifecycle-mcp to create requirements and plan features
2. Break features into vertical slices with clear acceptance criteria
3. Write tests before implementation (TDD)
4. Implement in small, verifiable commits
5. Verify with tests before marking tasks complete

### Testing Strategy
- Unit tests for game logic and card mechanics
- Integration tests for game flow and state transitions
- Component tests for Svelte UI interactions
- Use Vitest for testing framework
- Maintain 100% test coverage for core game logic

### Code Patterns
- Use Svelte5 runes ($state, $derived, $effect)
- Strong TypeScript typing for all game entities
- Immutable game state updates
- Event-driven architecture for game actions
- Reactive UI updates based on game state

### Planning Tools
- Use lifecycle-mcp for all planning activities:
  - Requirements gathering and user stories
  - Architecture decisions (ADRs)
  - Task breakdown and estimation
  - Progress tracking and commenting
  - Documentation generation

### MCP Integration
- Use context7 for library documentation and examples
- Reference latest Svelte5 and TypeScript patterns
- Leverage lifecycle-mcp for comprehensive project management