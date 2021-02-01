import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chat = ({ route }) => {
  const color = route.params.color;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: color,
      flex: 1,
    },
  });

  return <View style={styles.container}></View>;
};

export default Chat;
