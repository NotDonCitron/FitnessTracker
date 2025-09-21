# Evolution System Test Plan

## 🎯 **Test Objective**
Verify that the Pokemon Evolution System works correctly by simulating workout completion and observing evolution triggers.

## 📋 **Test Prerequisites**
- FitnessAppMario running in development mode (`npm run dev`)
- Browser developer console open to monitor logs
- Clean browser state (clear localStorage if needed)

## 🧪 **Test Scenarios**

### **Scenario 1: Basic Evolution Test**
**Steps:**
1. Navigate to the Workout tab
2. Complete 1-2 workouts with different exercise types (chest, legs, cardio)
3. Check console for Pokemon reward logs
4. Verify Pokemon appears in collection
5. Complete 3-5 more workouts
6. Monitor for evolution trigger messages in console

**Expected Results:**
- Pokemon rewards generated after workout completion
- Evolution engine analyzes workout patterns
- Evolution modal appears when conditions are met
- Pokemon evolves with animation and particles

### **Scenario 2: Evolution Conditions Test**
**Steps:**
1. Complete workouts focused on specific muscle groups (e.g., 3-4 chest workouts)
2. Check evolution requirements in console logs
3. Verify evolution conditions match workout patterns
4. Test with mixed workout types

**Expected Results:**
- Evolution requirements reflect user's workout history
- Pokemon evolves when type-specific conditions are met
- Evolution history is properly tracked

### **Scenario 3: Streak-Based Evolution**
**Steps:**
1. Complete workouts consistently for 3-5 days
2. Monitor streak calculations
3. Check if streak-based evolutions trigger
4. Test evolution with varying streak lengths

**Expected Results:**
- Streak requirements are properly calculated
- Evolution triggers include streak-based conditions
- Evolution modal shows streak-related evolution reasons

## 🔍 **Monitoring Points**
- Browser console for evolution engine logs
- Pokemon collection for new evolutions
- Evolution history in localStorage
- Evolution modal appearance and animations

## 📊 **Test Data Collection**
- Number of workouts needed to trigger evolution
- Evolution conditions met
- Evolution success rate
- Animation performance

## 🚨 **Troubleshooting**
- If no evolutions trigger: Check workout completion is properly saved
- If evolution fails: Verify Pokemon has evolution chain in PokeAPI
- If modal doesn't appear: Check evolution trigger callback is working

## ✅ **Success Criteria**
- Pokemon successfully evolve after meeting conditions
- Evolution modal displays with proper animations
- Evolution history is correctly saved
- User can see evolved Pokemon in collection