import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import firebase from 'firebase';
import 'firebase/firestore';

class CustomActions extends Component {
  constructor() {
    super();
  }

  // When user clicks action button
  onActionPress = () => {
    //   Options for user to choose from in ActionSheet
    const options = [
      'Select Image From Library',
      'Take a Photo',
      'Share Location',
      'Cancel',
    ];

    // Positions and displays ActionSheet
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return this.pickImage();
          case 1:
            return this.takePhoto();
          case 2:
            return this.getLocation();
          default:
        }
      }
    );
  };

  // Allows user to pick an image from their library
  pickImage = async () => {
    try {
      // Asks user's permission to access media library
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

      if (status === 'granted') {
        // Launches local picture gallery to choose image from
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        // Uploads image to database and sends image in chat
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Allows user to take a photo from their camera
  takePhoto = async () => {
    try {
      // Ask user's permission to access camera and media library
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.MEDIA_LIBRARY
      );

      if (status === 'granted') {
        // Launches camera and allows user to take a picture
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        // Uploads image to database and sends image in chat
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Upload image to Firebaes in blob format
  uploadImage = async (uri) => {
    try {
      // Convert image to blob format
      const blob = await new Promise((resolve, reject) => {
        // Creates new XMLHttp request
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (error) {
          console.log(error);
          reject(new TypeError('Network Request Failed'));
        };
        // Opens connection to receive image data and reponds as 'blob' type
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      // Creates unique file names for storage
      const uriParse = uri.split('/');
      const fileName = uriParse[uriParse.length - 1];

      // References remote database storage (Firestore)
      const ref = firebase.storage().ref().child(`${fileName}`);
      const snapshot = await ref.put(blob);
      blob.close(); // Close connection

      // Returns image's unique URL from remote database
      return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.log(error.message);
    }
  };

  // Gets user's location to send
  getLocation = async () => {
    try {
      // Ask user permission to access location
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        // Gets user's location
        let result = await Location.getCurrentPositionAsync({});
        const latitude = JSON.stringify(result.coords.latitude);
        const longitude = JSON.stringify(result.coords.longitude);

        if (result) {
          // Sends user's location
          this.props.onSend({
            location: {
              latitude,
              longitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.container]}
        accessibilityLabel='Action button'
        accessibilityHint='Select an image to send, take a picture, or send current location'
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#2b2b2b',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

export default CustomActions;

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
