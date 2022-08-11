import React, { Component } from 'react';

import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as Font from 'expo-font';

import Start from './components/Start';
import Chat from './components/Chat';

// Create the navigator
const Stack = createStackNavigator();

export default class App extends Component {
    async loadFonts() {
        await Font.loadAsync({
            'Poppins-Regular': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
            'Poppins-Bold': require('./assets/fonts/Poppins/Poppins-Bold.ttf'),
            'Poppins-Light': require('./assets/fonts/Poppins/Poppins-Light.ttf'),
        });
        this.setState({ fontsLoaded: true });
    }

    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false
        }
    }

    render() {
        if (!this.state.fontsLoaded) { return null }

        return (
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Start"
                >
                    <Stack.Screen
                        name="Start"
                        component={Start}
                        options={{
                            headerShown: false
                        }}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={Chat}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    componentDidMount() {
        this.loadFonts();
    }
}