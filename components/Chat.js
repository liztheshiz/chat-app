import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day } from 'react-native-gifted-chat';

export default class Chat extends Component {
    // CUSTOM METHODS
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    renderBubble(props) {
        //const color = (this.props.route.params.color === '#474056') ? '#B9C6AE' : '#474056';
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


    // LIFECYCLE METHODS
    constructor() {
        super();
        this.state = {
            messages: [],
        }
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
        this.setState({
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
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})