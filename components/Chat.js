import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, ImageBackground, TextInput, Button } from 'react-native';

export default class Chat extends Component {
    componentDidMount() {
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });
    }

    render() {
        const { color } = this.props.route.params;

        return (
            <ScrollView style={{ backgroundColor: color }}>
                <View style={styles.container}>
                    <Text style={styles.text}>Chat Screen</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
    },
})