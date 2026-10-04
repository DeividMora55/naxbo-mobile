import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
function Shell(){const {dark}=useTheme();return <><StatusBar style={dark?'light':'dark'}/><Stack screenOptions={{headerShown:false,animation:'fade'}}/></>}
export default function RootLayout(){return <GestureHandlerRootView style={{flex:1}}><AuthProvider><ThemeProvider><Shell/></ThemeProvider></AuthProvider></GestureHandlerRootView>}
