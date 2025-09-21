# Evolution System Improvements Todo

## Comment 1: Immediate evolution triggers not implemented

- [ ] Update `useEvolutionEngine.handleActivityEvent` to accept a third argument: `pokemonsToCheck: PokemonWithEvolution[]`
- [ ] Iterate pokemons, call `await updateEvolutionProgress(p)`, then `await evolvePokemon(updatedP, { triggerType: eventType === 'workout' ? 'instant_workout' : eventType === 'streak' ? 'instant_streak' : 'instant_milestone', triggerContext: context })`
- [ ] In `usePokemonRewards.ts`, call `evolutionEngine.handleActivityEvent('workout'|'streak'|'milestone', context, rewards.map(r => r.pokemon))` after each event

## Comment 2: Recent-activity weighting computed but ignored in eligibility

- [ ] In `useEvolutionEngine.ts`, compute `const effectiveCompleted = Math.floor(progress.workoutsCompletedWeighted ?? progress.workoutsCompleted)`
- [ ] Replace `hasEnoughWorkouts` with `effectiveCompleted >= (conditions.requiredWorkouts || 0)`
- [ ] Optionally, expose `effectiveCompleted` in progress for UI/debugging

## Comment 3: Milestone trigger wiring incomplete

- [ ] In `usePokemonRewards.ts`, return `handleMilestoneCompletion` from the hook's public API
- [ ] Destructure `onMilestoneComplete` from props if you intend to relay it, or remove it if unused
- [ ] In the component that composes hooks, pass the returned `handleMilestoneCompletion` to `useSkills` as the `onMilestoneComplete` argument

## Comment 4: Evolution events always use 'workout' triggerType

- [ ] Change `evolvePokemon` signature to accept options object with triggerType, triggerReason, triggerContext, activityLevel
- [ ] Use provided values when constructing `EvolutionEvent`
- [ ] From `handleActivityEvent`, call `evolvePokemon(..., { triggerType: 'instant_workout'|'instant_streak'|'instant_milestone', triggerReason: '<reason>', triggerContext: context?.triggerContext, activityLevel })`

## Comment 5: Type mismatch on onEvolutionTriggered

- [ ] In `useEvolutionEngine.ts`, change `UseEvolutionEngineProps.onEvolutionTriggered` to `(from: PokemonWithEvolution, to: PokemonWithEvolution, reason: string) => void`
- [ ] Update the `evolutionEvent` creation to use `PokemonWithEvolution` for both `fromPokemon` and `toPokemon`
- [ ] Remove `any` casts in `usePokemonRewards.ts`

## Comment 6: calculateActivityMultiplier may misclassify activity

- [ ] Replace `reduce((total, w) => total + w.duration, 0)` with `reduce((total, w) => total + (Number(w.duration) || 0), 0)`
- [ ] Consider validating `w.date` before `new Date(w.date)` usage and skip invalid entries

## Comment 7: Immediate triggers should iterate current rewards

- [ ] Add `async function processImmediateEvolutions()` in `usePokemonRewards.ts`
- [ ] Call `processImmediateEvolutions()` after `createReward`, `triggerStreakReward`, and in `handleMilestoneCompletion` with appropriate trigger types

## Comment 8: Streak requirement currently counts recent completed workouts

- [ ] In `useEvolutionEngine.ts`, replace `hasStreak` with a consecutive-day calculation
- [ ] Alternatively, rename `minWorkoutStreak` to `minWorkoutsInWindow` to clarify semantics
