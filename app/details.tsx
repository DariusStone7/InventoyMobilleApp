import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, KeyboardAvoidingView, Platform, PermissionsAndroid, } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Product from "@/models/Product";
import ProductComponent from "@/components/productCard";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TextInput, ActivityIndicator } from 'react-native-paper';

export default function DetailsScreen(){

    const { fileData, fileUri, fileName } = useLocalSearchParams();
    let [products, setProducts] = useState<Product[]>([]);
    let [currentProducts, setcurrentProducts] = useState<Product[]>([]);
    let [refreshing, setRefreshing] = useState<boolean>(false);
    let [searchText, setSearchText] = useState<string>();
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [selectedPoduct, setSelectedProduct] = useState<Product>();
    let [selectedIndex, setSelectedIndex] = useState<Number>();
    let [searching, setSearching] = useState<boolean>(false);

    //initialisation de la liste de produits lorsque le composant est monté
    useEffect( () => {

        let productsList = initProducts(fileData);
        setcurrentProducts(productsList);
        setProducts(productsList);

        console.log("aaaaaaaaaaaaaaaaaaaaaaa", fileUri);

    }, []);


    //Rechargement de la liste des produits lorsqu'on actualise l'écran
    const onRefresh = () => {

        setRefreshing(true);
        setcurrentProducts(products);
        setTimeout(() => { setRefreshing(false) }, 500);

    }


    //Formatage du contenu du fichier en un tableau de produit
    const initProducts = (data : string | string[]) => {

        data = (fileData.toString()).split(',');
        data = data.filter( item => item !== "" );
            
        let products = [] as Product[];

        data.forEach( (line) => {

            let lineSplit = line.split(";");
            let name = lineSplit[1].slice(0, lineSplit[1].indexOf('('));
            let cdt = lineSplit[1].slice(lineSplit[1].indexOf('('), lineSplit[1].length);

            let product = new Product(lineSplit[0], name, cdt, Number(lineSplit[2]));
    
            products.push(product);

        });

        return products;

    }


    //Filtre de la liste des produits en fonction de la valeur de recherche saisie
    const filterProducts = (key:string) => {
        
        // setSearching(false)
        setcurrentProducts(products);

        //Afficher toute la liste s'il y'a aucun texte à rechercher
        if(key.length === 0){
            setcurrentProducts(products);
            setSearching(false);

            return;
        }

        //filtrer la liste des produits en fonction du texte à rechercher
        let result = currentProducts.filter( (product) => {
            return (product.getName()).includes(key.toUpperCase());
        });
        //Afficher la liste des produits trouvés
        setcurrentProducts(result);

        // setSearching(true);
        
    }


    //Mis à jour de la quantité du produit selectionné avec la nouvelle valeur saisir
    const updateQuantity = (quantity: string) => {
        
        let product = new Product(selectedPoduct?.getId(), selectedPoduct?.getName(), selectedPoduct?.getCondtionment(), selectedPoduct?.getQuantity());

        product?.setQuantity(Number(quantity));

        setSelectedProduct(product);

        //mise à jour de la quantité dans la liste courante
        currentProducts.forEach((product) => {
            if( product.getId() == selectedPoduct?.getId()){
                product.setQuantity(Number(quantity));
                return;
            }
        });

        //mise à jour de la quantité dans toute la liste
        products.forEach((product, index) => {
            if( product.getId() == selectedPoduct?.getId()){
                product.setQuantity(Number(quantity));
                setSelectedIndex(index);
                return;
            }
        });
        
        setProducts(products);

    }


    //Traitement lors de l'ouverture du modal
    const openModal = (product : Product, index: Number) => {

        setSelectedProduct(product);
        setSelectedIndex(index);
        setModalVisible(true);

        return null;
    }


    //Traitement lors de la cloture du modal
    const closeModal = () => {
        
        setModalVisible(false);
        console.log('Produit mis à jour: ', products[Number(selectedIndex)]);

    }


    const formatFile = () => {

        let data = "";

        //Reconstitution du contenu du fichier
        products.forEach( (product) => {
            data += product.getId() + ";" + product.getName() + product.getCondtionment() + ";" + product.getQuantity() + "\r\n";
        });

        return data;
    }


    const saveInventoryToFile = async() => {
        
        let data = formatFile();

        //Demande de permission d'accès au stockage
        // const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, );
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        const docDir = FileSystem.documentDirectory as string;

        FileSystem.writeAsStringAsync(fileUri.toString(), data, { encoding: FileSystem.EncodingType.UTF8 })
            .then(() => alert('save '))
            .catch((e) => console.log('Error', e));

        // if(permission.granted){

        //     //Création et enregistrement du nouveau fichier
        //     await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, fileName.toString(), "text/plain")
        //         .then( async (uri) => {
        //             FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 })
        //             .then(r => alert("Fichier enregistré avec succès !"))
        //             .catch(e => alert("Une erreur est survenue lors de l'enregistrement: " + e));

        //         })
        //         .catch(e => alert("Une erreur est survenue lors de la création du fichier: " + e));
        // }

    }


    //Partager le fichier
    const shareFile = async () => {

        let data = formatFile();
        const newFileUri = `${FileSystem.documentDirectory}${fileName}`;

        // FileSystem.copyAsync({from: fileUri.toString(), to: newFileUri});
        FileSystem.writeAsStringAsync(newFileUri, data);

        await Sharing.shareAsync(newFileUri)
            .then(response => console.log(response))
            .catch(error => console.error(error));

    }


    const animate = () => {
        setSearching(false);
    }

    //Vue à afficher à l'écran
    return (
        
        <View style={ {paddingVertical: 20, paddingHorizontal:10, backgroundColor: "#eff5f7",} }>

            <Stack.Screen 
                options={{
                    headerRight: () => 
                    <View style={styles.buttons}>
                         <Ionicons name="save-outline" color="#fff" size={20} onPress={saveInventoryToFile}></Ionicons>
                         <Ionicons name="share-social-outline" color="#fff" size={20} onPress={shareFile}></Ionicons> 
                    </View> 
                }}
             />
            <View style={styles.buttons}>
                         <Ionicons name="save-outline" color="#000" size={20} onPress={saveInventoryToFile}></Ionicons>
                         <Ionicons name="share-social-outline" color="#000" size={20} onPress={shareFile}></Ionicons> 
            </View> 
            <TextInput 
                value={searchText}
                placeholder="Rechercher"
                placeholderTextColor={"#00000061"}
                selectTextOnFocus
                onChangeText={
                    (key) => {
                        setSearchText(key);
                        filterProducts(key);
                    }
                }
                // onEndEditing={animate}
                
                style = { styles.seachInput }
                right = {
                    <TextInput.Icon  icon={"microphone"} color={"#00000061"} /> 
                }
                left = {
                    <TextInput.Icon  icon={searching ? "" : "magnify"} color={"#00000061"} /> 
                }
                cursorColor="#00000061"
                selectionColor="#bb661639"
                mode="outlined"
                outlineStyle={{borderColor:"#fff", borderRadius: 20}}
                contentStyle={{paddingLeft: 0, margin:0, color: "#0000009b"}}
            /> 
            <ActivityIndicator style={ searching ? {position:'absolute', left: 0, margin: 28, borderColor: "#000000b9"} : {display:"none"} } animating={searching} color="#000000b9" size={22} />

            <FlatList
                data={currentProducts} 
                renderItem={ 
                    ({item, index}) => <Text onPress={()=>{openModal(item, index)}} style={styles.productCard}> <ProductComponent product={item}/> </Text>
                }
                keyExtractor={(item) => item.getId()}
                contentContainerStyle = {styles.flatlistContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                style={styles.flatlist}
                showsVerticalScrollIndicator={ false } 
                ListFooterComponent={ () => <Text> Nombre de Produits: { currentProducts.length } / { products.length } </Text> }
                ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun produit trouvé ! </Text> }
                
            />

            <Modal transparent={ true } animationType="slide" visible={ modalVisible } onPointerLeave={ () => setModalVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} } behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                    <TouchableOpacity onPress={ closeModal } style={ styles.modalOverlay } activeOpacity={ 1 }>
                        <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                            <Ionicons name="checkmark-circle-outline" size={ 42 } color="#02c4ba" onPress={ closeModal } style={ styles.closeButton }></Ionicons>
                            <Text style={ {fontSize:20, color: "#0000009b", fontWeight: "bold", textAlign: "left", } }>{ selectedPoduct?.getName() } </Text>
                            <Text style={ {fontSize:16, color: "#0000009b",} }>{ selectedPoduct?.getCondtionment() } </Text>
                            <Text style={ {fontSize:16, color: "#0000009b", marginTop: 20,} }>Quantité: </Text>
                            <TextInput 
                                onBlur={ closeModal } 
                                placeholder="Quantité" 
                                value={ (selectedPoduct?.getQuantity())?.toString() } 
                                onChangeText={ (text) => {updateQuantity(text)} } 
                                selectTextOnFocus keyboardType="numeric" 
                                style={ styles.input } 
                                cursorColor="#000"
                                selectionColor="#bb661639"
                                mode="outlined"
                                outlineStyle={{borderColor:"#fff", }}
                                contentStyle={{paddingLeft: 0, margin:0}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

        </View>

    )
}


//définition des styles
const styles = StyleSheet.create({
    flatlist:{
      marginVertical: 0,
      marginBottom: 50,
    },
    flatlistContainer:{
        gap: 8,
    },
    seachInput:{
        backgroundColor: "#fff",
        height: 40,
        width: "100%",
        paddingHorizontal: 10,
        borderRadius: 20,
        marginBottom: 20,
        
    },
    productCard:{
        // backgroundColor: "#d7eef0",
        borderRadius: 10,
        width: Dimensions.get('window').width,
        height: "auto",
    },
    modal:{
       backgroundColor: "#dfeaee",
       width: "100%",
       height: "45%",
       position: "absolute",
       bottom: 0,
       borderTopRightRadius: 25,
       borderTopLeftRadius: 25,
       paddingHorizontal: 20,
       paddingVertical: 50,
    },
    modalOverlay:{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton:{
        position: "absolute",
        top: 10,
        right: 10,
    },
    input:{
        height: 50,
        width: "100%",
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 4,
    },
    buttons:{
        display: "flex",
        flexDirection: "row",
        gap: 15,
    }
})