import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Home() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Floss my teeth',
      category: 'Hygiene',
      points: 5,
      completed: true,
      icon: '🦷',
      color: '#8B5CF6'
    },
    {
      id: 2,
      title: 'Brush teeth',
      category: 'Hygiene',
      points: 5,
      completed: false,
      progress: '1 / 2',
      icon: '🪥',
      color: '#06B6D4'
    },
    {
      id: 3,
      title: 'Write in journal',
      category: 'Self-kindness',
      points: 5,
      completed: true,
      icon: '📖',
      color: '#F97316'
    },
    {
      id: 4,
      title: 'Take 3 deep breaths',
      category: 'Self-kindness',
      points: 5,
      completed: true,
      icon: '🍃',
      color: '#10B981'
    },
    {
      id: 5,
      title: 'Take a stretch break',
      category: 'Self-kindness',
      points: 5,
      completed: true,
      icon: '🦒',
      color: '#F59E0B'
    },
    {
      id: 6,
      title: 'Wash my face',
      category: 'Hygiene',
      points: 5,
      completed: true,
      icon: '🧼',
      color: '#EC4899'
    }
  ]);

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const remainingGoals = totalGoals - completedGoals;

  const toggleGoal = (goalId) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const renderGoalItem = (goal) => (
    <TouchableOpacity
      key={goal.id}
      style={styles.goalItem}
      onPress={() => toggleGoal(goal.id)}
      activeOpacity={0.8}
    >
      <View style={styles.goalContent}>
        <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
          <Text style={styles.goalIcon}>{goal.icon}</Text>
        </View>
        
        <View style={styles.goalInfo}>
          <View style={styles.titleRow}>
            {goal.progress && (
              <Text style={styles.progressText}>{goal.progress} </Text>
            )}
            <Text style={styles.goalTitle}>{goal.title}</Text>
          </View>
          <Text style={styles.goalCategory}>{goal.category}</Text>
        </View>

        <View style={styles.goalRight}>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{goal.points}</Text>
            <Text style={styles.pointsIcon}>⚡</Text>
          </View>
          
          <View style={[
            styles.statusButton,
            goal.completed ? styles.completedButton : styles.pendingButton
          ]}>
            {goal.completed ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : (
              <Text style={styles.plusIcon}>+</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
          <Text style={styles.headerTitle}>
            {remainingGoals} goals left for today!
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>≡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⋮⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.goalsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.goalsContainer}
      >
        {goals.map(renderGoalItem)}
        
        <TouchableOpacity style={styles.addGoalButton} activeOpacity={0.8}>
          <View style={styles.addGoalContent}>
            <Text style={styles.addGoalIcon}>+</Text>
            <Text style={styles.addGoalText}>Add a goal</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsList: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  goalsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  goalItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  goalCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  goalRight: {
    alignItems: 'center',
    gap: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 2,
  },
  pointsIcon: {
    fontSize: 12,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  pendingButton: {
    backgroundColor: '#E5E7EB',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plusIcon: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addGoalButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginTop: 20,
  },
  addGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addGoalIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  addGoalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});