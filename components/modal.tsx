import { View, Text, StyleSheet } from "react-native";
import { PropsWithChildren } from "react";

type props = PropsWithChildren<({
    isVisible: boolean,
    onClose: () => void,
})>;

export default function modal({isVisible, onClose}: props){

}