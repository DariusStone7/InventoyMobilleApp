import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";


type props={
    icon: any,
    iconColor: string,
    isVisible: boolean,
    message: string,
    buttonText: string,
    onClose: ()=> void,
}


export default function modal({icon, iconColor, isVisible, message, buttonText, onClose}:props){

    return (
        <Modal animationType="fade" visible={isVisible} transparent={ true }>
            <TouchableOpacity style={{flex:1, justifyContent:"center", backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems:"center"}} activeOpacity={ 1 }>
                <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                    <View>
                        <Ionicons style={styles.icon} name={icon} color={iconColor} size={24}></Ionicons>
                        
                        <ScrollView style={{maxHeight: 40, width:"100%", overflow:"scroll"}}>
                            <Text style={{fontSize: 15, fontWeight: "300"}}>{message}</Text>
                        </ScrollView>

                        <Text onPress={onClose} style={{fontSize: 16, fontWeight: "400", textAlign: "right", position:"absolute", bottom:-50, right:0}}>{buttonText}</Text>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )

}


//définition des styles
const styles = StyleSheet.create({
   
    modal:{
       backgroundColor: "#dfeaee",
       width: "80%",
       height: 160,
       borderRadius: 15,
       justifyContent: "center",
       alignItems:"center",
       paddingHorizontal: 10,
    },
    modalOverlay:{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    icon:{
        position:"absolute", 
        top:-50, 
        left:0
    }
})