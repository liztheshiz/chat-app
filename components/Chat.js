import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day } from 'react-native-gifted-chat';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
    // CUSTOM METHODS
    onSend(messages = []) {
        // First add new message to state
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }));
        // Then add this message to database
        // should check to see if online before attempting to do this?
        const newMessage = this.state.messages[0]
        this.referenceChatMessages.add({
            _id: newMessage._id,
            text: newMessage.text,
            createdAt: newMessage.createdAt.toDate(),
            user: newMessage.user,
            system: newMessage.system,
        })
    }

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

    renderDay(props) {
        return <Day {...props} textStyle={{ color: 'white', fontFamily: 'Poppins-Regular' }} />
    }

    renderSystemMessage(props) {
        return <SystemMessage {...props} textStyle={{ color: 'white', fontFamily: 'Poppins-Regular' }} />
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
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
    };


    // LIFECYCLE METHODS
    constructor() {
        super();
        this.state = {
            messages: [],
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

        return (
            <View style={[styles.container, { backgroundColor: color }]}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderDay={this.renderDay.bind(this)}
                    renderSystemMessage={this.renderSystemMessage.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
            </View>

            /*<ScrollView style={{ backgroundColor: color }}>
            <View style={styles.container}>
                <Text style={styles.text}>Chat Screen</Text>
            </View>
    </ScrollView>*/
        );
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });

        this.referenceChatMessages = firebase.firestore().collection('messages');
        if (this.referenceChatMessages) {
            this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);
        } else {
            this.setState({
                messages: [
                    {
                        _id: 2,
                        text: `${name} has entered the chat`,
                        createdAt: new Date(),
                        system: true,
                    },
                ]
            });
        }

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
                {
                    _id: 2,
                    text: `${name} has entered the chat`,
                    createdAt: new Date(),
                    system: true,
                },
            ],
        })*/
    }

    componentWillUnmount() {
        this.unsubscribe();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})