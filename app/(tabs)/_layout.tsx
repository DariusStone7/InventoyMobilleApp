import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout(){
    return(
        <Tabs initialRouteName="index"
            screenOptions={{
            headerShown:false,
            tabBarActiveTintColor: "#025c57"
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title:"Accueil",
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                    )
                }} 
            />
            <Tabs.Screen 
                name="about" 
                options={{
                    title:"A propos",
                    tabBarIcon:({color, focused}) => (
                        <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
                    )
                }}/>
        </Tabs>
    )
}