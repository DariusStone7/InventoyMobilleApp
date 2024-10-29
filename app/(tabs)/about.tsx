import { View, Text, StyleSheet } from "react-native";

export default function AboutScreen(){
    return(
        <View style={styles.container}>
            <Text style={styles.text}>A propos</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 15,
    },
})