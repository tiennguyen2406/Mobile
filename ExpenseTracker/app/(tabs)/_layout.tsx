import React from 'react';
import { Tabs, Link } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          // Câu 1c: Tiêu đề
          title: 'EXPENSE TRACKER',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="add-circle"
                    size={30}
                    color="blue"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics', // (Câu 12)
          tabBarIcon: ({ color }) => <Ionicons size={28} name="pie-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Trash', // (Câu 5)
          tabBarIcon: ({ color }) => <Ionicons size={28} name="trash" color={color} />,
        }}
      />
    </Tabs>
  );
}