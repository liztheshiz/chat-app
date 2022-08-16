import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day } from 'react-native-gifted-chat';

import AsyncStorage from "@react-native-async-storage/async-storage";

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

    // Adds message to firestore on send
    onSend(messages = []) {
        // !!should check to see if online before attempting to do this!!
        const newMessage = messages[0]
        this.referenceChatMessages.add({
            _id: newMessage._id,
            text: newMessage.text,
            createdAt: newMessage.createdAt,
            user: newMessage.user,
            system: false,
        })
    }

    // Loops through documents in firestore collection and adds them to the state
    // Called on mount (on 'messages' collection)
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: data.user,
                system: data.system,
            });
        });
        this.setState({
            messages,
        });
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
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: uid,
                    }}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
            </View>
        );
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });

        // Check (anonymous) user authentication through firebase
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                await firebase.auth().signInAnonymously();
            }

            //update user state with currently active user data
            this.setState({
                uid: user.uid,
            });

            this.referenceChatMessages = firebase.firestore().collection('messages');

            if (this.referenceChatMessages) {
                this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
            } else {
                this.setState({
                    messages: [
                        {
                            _id: 1,
                            text: `Unable to connect to chat`,
                            createdAt: new Date(),
                            system: true,
                        },
                    ]
                });
            }
        });

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
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.authUnsubscribe();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})