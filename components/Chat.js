import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet } from 'react-native';

import { GiftedChat, Bubble, SystemMessage, Day, InputToolbar } from 'react-native-gifted-chat';

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';

import MapView from 'react-native-maps';

import CustomActions from './CustomActions';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
    // CUSTOM METHODS

    // Customize chat bubbles
    renderBubble(props) {
        let bubbleColor;
        if (this.props.route.params.color === '#090C08') bubbleColor = '#8A95A5'
        else if (this.props.route.params.color === '#474056') bubbleColor = '#a1ad97'
        else if (this.props.route.params.color === '#8A95A5') bubbleColor = '#a1ad97'
        else if (this.props.route.params.color === '#B9C6AE') bubbleColor = '#474056'

        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: bubbleColor
                    }
                }}
                textStyle={{
                    right: {
                        color: 'white'
                    }
                }}
            />
        )
    }

    // Customize Date shown upon entering chat
    renderDay(props) {
        return <Day {...props} textStyle={{ color: 'white', fontFamily: 'Poppins-Regular' }} />
    }

    // Customize system messages
    renderSystemMessage(props) {
        return <SystemMessage {...props} textStyle={{ color: 'white', fontFamily: 'Poppins-Regular' }} />
    }

    // Customize input toolbar
    // Only displays if online!
    renderInputToolbar(props) {
        if (this.state.isConnected) {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    }

    // Renders action button to send images and location
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{
                        width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3
                    }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    // Adds message to firestore on send
    onSend(messages = []) {
        const newMessage = messages[0]
        this.referenceChatMessages.add({
            _id: newMessage._id,
            text: newMessage.text || '',
            createdAt: newMessage.createdAt,
            user: newMessage.user,
            image: newMessage.image || null,
            location: newMessage.location || null,
            system: false,
        });
    }

    // Loops through documents in firestore collection and adds them to the state
    // Called on mount (on 'messages' collection)
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text || '',
                createdAt: data.createdAt.toDate(),
                user: data.user,
                image: data.image || null,
                location: data.location || null,
                system: data.system,
            });
        });

        this.setState({
            messages,
        });

        // Sync fetched messages with asyncStorage (local)
        this.saveMessages();
    }

    // Saves userID in asyncStorage (local)
    async saveUser() {
        let uid = this.state.uid;

        try {
            await AsyncStorage.setItem('uid', uid);
        } catch (error) {
            console.log(error.message);
        }
    }

    // Fetches uid from asyncStorage (local)
    async getUser() {
        let user = '';
        try {
            user = await AsyncStorage.getItem('uid') || [];
            this.setState({
                uid: user
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    // Saves messages in asyncStorage (local)
    async saveMessages() {
        let messages = this.state.messages;

        try {
            await AsyncStorage.setItem('messages', JSON.stringify(messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    // Fetches messages from asyncStorage (local)
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    }


    // LIFECYCLE METHODS
    constructor() {
        super();

        this.state = {
            messages: [],
            uid: '',
            isConnected: false,
        }

        const firebaseConfig = {
            apiKey: "AIzaSyCInaMPfpqaogmo1HhyH6DJhHGwmYwr5t4",
            authDomain: "chat-app-2c26d.firebaseapp.com",
            projectId: "chat-app-2c26d",
            storageBucket: "chat-app-2c26d.appspot.com",
            messagingSenderId: "935609770809",
            appId: "1:935609770809:web:d8487f812f59de102d3ee8",
            measurementId: "G-XY1HED78LK"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.referenceChatMessages = firebase.firestore().collection('messages');
    }

    render() {
        const { color } = this.props.route.params;
        const { uid } = this.state;

        return (
            <View style={[styles.container, { backgroundColor: color }]}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderDay={this.renderDay.bind(this)}
                    renderSystemMessage={this.renderSystemMessage.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: uid,
                    }}
                />
                {/* Fixes keyboard overlap on some Android devices */}
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
            </View>
        );
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });

        // Get user before loading messages so they load on correct side of screen
        this.getUser();

        // First load messages from asyncStorage
        this.getMessages();

        // Then check if online to sync with firestore and save any updated messages
        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                this.setState({ isConnected: true });

                // Check (anonymous) user authentication through firebase
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                    if (!user) {
                        await firebase.auth().signInAnonymously();
                    }

                    // Update user state with currently active user data
                    this.setState({
                        uid: user.uid,
                    });

                    // Save userID to local storage
                    this.saveUser();

                    // Get messages from firestore
                    this.referenceChatMessages = firebase.firestore().collection('messages');
                    this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
                });
            } else {
                // Add offline message
                this.props.navigation.setOptions({ title: `${name} (offline)` });
            }
        });
    }

    componentWillUnmount() {
        if (this.state.isConnected) {
            this.unsubscribe();
            this.authUnsubscribe();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

// Keeping this to reference avatar/system user
/*this.setState({
    messages: [
        {
            _id: 1,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
            },
        },
*/