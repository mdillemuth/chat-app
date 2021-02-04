import React, { Component } from 'react';
import {
  View,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  LogBox,
} from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

// Google Firebase
const firebase = require('firebase');
require('firebase/firestore');

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
    };

    // Initialize connection to Firebase database
    const firebaseConfig = {
      apiKey: 'AIzaSyAr7k41KHO2yRylrf5P4TXlmIBYGmy1tlk',
      authDomain: 'test-97f37.firebaseapp.com',
      projectId: 'test-97f37',
      storageBucket: 'test-97f37.appspot.com',
      messagingSenderId: '883540949846',
      appId: '1:883540949846:web:07e08bd6a925e0db66f4f7',
      measurementId: 'G-23KWSF5HTT',
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceChatMessages = firebase.firestore().collection('messages');
    LogBox.ignoreLogs(['Setting a timer']);
  }

  // Sets state with a static message
  componentDidMount() {
    let { name } = this.props.route.params;

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          await firebase.auth().signInAnonymously();
        } catch (error) {
          console.error(error.message);
        }
      }

      // Update user state
      this.setState({
        user: {
          _id: user.uid,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
        },
        messages: [],
      });

      // Creates reference to active user's messages
      this.referenceChatMessages = firebase.firestore().collection('messages');
      // Lists for collection changes of currnet user
      this.unsubscribeChatUser = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    // Stops listening for authentication
    this.unsubscribeChatUser();
    // Stops listening for changes
    this.authUnsubscribe();
  }

  // Updates messages state
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Iterate through each document
    querySnapshot.forEach((doc) => {
      let data = doc.data(); // Grabs QueryDocumentSnapshot's data
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text || null,
        user: data.user,
      });
    });
    this.setState({ messages });
  };

  // Adds messages to firebase database
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text || null,
      user: message.user,
    });
  }

  // Event handler for when chat message is sent
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
  }

  // Here you can modify the color of the chat bubble from the sender
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#08d9d6',
          },
        }}
      />
    );
  }

  render() {
    const color = this.props.route.params.color; // Color user selected in Start.js
    const styles = StyleSheet.create({
      container: {
        backgroundColor: color,
        flex: 1,
      },
    });

    const { name } = this.props.route.params;
    const { messages } = this.state;

    return (
      <View style={styles.container}>
        <GiftedChat
          renderBubble={this.renderBubble}
          messages={messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.uid,
            avatar: 'https://placeimg.com/140/140/any',
            name: name,
          }}
        />
        {/* Android keyboard fix */}
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior='height' />
        ) : null}
      </View>
    );
  }
}

export default Chat;
