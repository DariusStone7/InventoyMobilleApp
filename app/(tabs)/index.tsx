import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Button from "@/components/button";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import * as FileSystem from 'expo-file-system';
import { useRouter, Link, useNavigation } from "expo-router";

export default function Index() {

  const router = useRouter();
  const navigation = useNavigation();

  const [selectedFileUri, setSelectedFileUri] = useState<string>();
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();
  const [selectedFileData, setSelectedFileData] = useState<string | undefined>();

  const documentPicker = async()=>{

    setSelectedFileData("");
    setSelectedFileName("");
    // setSelectedFileUri("");
    
    try{
      let result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        copyToCacheDirectory: true,
      });
  
      if(!result.canceled){
        
        console.log(result);

        setSelectedFileName(result.assets[0].name);

        if(!(result.assets[0].name).toLowerCase()?.endsWith(".txt")){
          alert('Vueillez selectionner un fichier texte (.txt) !');
          setSelectedFileName("");

          return;
        }

        setSelectedFileUri(result.assets[0].uri);
        
        let fileData = await FileSystem.readAsStringAsync(result.assets[0].uri, {encoding: FileSystem.EncodingType.UTF8});
        setSelectedFileData(fileData);
      }
      else{
        alert("Vous n'avez selectionné aucun fichier");
      }
    }catch(e){
      setSelectedFileData("");
      setSelectedFileName("");
      setSelectedFileUri("");
      alert("Une erreur est survenue: " + e);
    }
    

  }

  const goToEditscreen = () => {
    let data = selectedFileData?.split(/\r?\n/);
    router.push(`/details?fileData=${data}&fileUri=${selectedFileUri}&fileName=${selectedFileName}`);
  }

  return (
    <View style={styles.container}>
     <View style={styles.fileBlock}>
        <Text style={styles.message}> appuyer sur le bouton pour ouvrir une fiche d'inventaire </Text>
        <Button label="Ouvrir" icon="file-tray-outline" onPress={documentPicker} type="primary"/>
        {/* <Text style={styles.text}>fichier selectionné: {selectedFileName}</Text> */}
      </View>
      { selectedFileName ? (
        <View style={{width:"100%"}}>
          <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"baseline", backgroundColor: "#ffffff", padding:10}}>
            <Text style={styles.text}>{(selectedFileName).length < 16 ? (selectedFileName) : (selectedFileName).slice(0, 16) + "..."}</Text>
            <Button label="Editer" icon="pencil-sharp" onPress={goToEditscreen} type="outline"/>
          </View>
          <ScrollView style={styles.content} >
            <Text>{selectedFileData}</Text>
          </ScrollView>
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff5f7",
  },
  fileBlock:{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#a08e8e",
    // maxHeight: "auto",
  },
  message:{
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  text:{
    marginTop: 10,
    fontSize: 18,
  },
  content:{
    borderTopWidth: 0.5,
    borderTopColor: "#025c581a",
    maxHeight: 250,
    overflow: "scroll",
    backgroundColor: "#fff",
    // padding: 10,
    paddingLeft: 10,
  }
})
