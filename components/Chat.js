import React, { Component } from 'react';
import {
  Alert,
  View,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  LogBox,
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';
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
      isConnected: false,
      image: null,
      location: null,
    };

    const firebaseConfig = {
      apiKey: 'AIzaSyAr7k41KHO2yRylrf5P4TXlmIBYGmy1tlk',
      authDomain: 'test-97f37.firebaseapp.com',
      projectId: 'test-97f37',
      storageBucket: 'test-97f37.appspot.com',
      messagingSenderId: '883540949846',
      appId: '1:883540949846:web:07e08bd6a925e0db66f4f7',
      measurementId: 'G-23KWSF5HTT',
    };

    // Connect to Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // References Firebase messages
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // Ignores certain warning messages in console
    LogBox.ignoreLogs([
      'Setting a timer',
      'undefined',
      'Animated.event now requires a second argument for options',
    ]);
  }

  componentDidMount() {
    let { name } = this.props.route.params;

    // Check user connection
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });

        // Reference to load messages via Firebase
        this.referenceChatMessages = firebase
          .firestore()
          .collection('messages');

        // Authenticates user via Firebase
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // Add user to state
            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name: name,
                avatar: 'https://placeimg.com/140/140/any',
              },
              messages: [],
            });
            // Listener for collection changes for current user
            this.unsubscribeChatUser = this.referenceChatMessages
              .orderBy('createdAt', 'desc')
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setState({ isConnected: false });
        this.getMessages();
        Alert.alert(
          'No internet connection detected | Unable to send messages'
        );
      }
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
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || '',
        location: data.location || null,
      });
    });
    this.setState({ messages });
  };

  // Retrieve messages from client-side storage
  getMessages = async () => {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({ messages: JSON.parse(messages) });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Saves messages in client-side storage
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        'messages',
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  // Delete messages in client-side storage
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  };

  // Adds messages to cloud storage
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      uid: this.state.uid,
      createdAt: message.createdAt,
      text: message.text || '',
      user: message.user,
      image: message.image || '',
      location: message.location || null,
    });
  }

  // Event handler for sending messages
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }

  // Renders message input only when app is online
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // Renders sender's chat bubble with custom color
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

  // Returns a MapView that shows user's location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          showsUserLocation={true}
          style={{
            width: 150,
            height: 100,
            borderRadius: 15,
            margin: 5,
          }}
          region={{
            longitude: Number(currentMessage.location.longitude),
            latitude: Number(currentMessage.location.latitude),
            longitudeDelta: 0.0421,
            latitudeDelta: 0.0922,
          }}
        />
      );
    }
    return null;
  }

  renderActions = (props) => {
    return <CustomActions {...props} />;
  };

  render() {
    const { name, color } = this.props.route.params;
    const { messages } = this.state;

    const styles = StyleSheet.create({
      container: {
        backgroundColor: color,
        flex: 1,
      },
    });

    return (
      <View style={styles.container}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderUsernameOnMessage={true}
          renderCustomView={this.renderCustomView}
          renderActions={this.renderActions}
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
