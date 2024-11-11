import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Pressable, TouchableOpacity, Dimensions, Modal, KeyboardAvoidingView, Platform, Button} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Product from "@/models/Product";
import ProductComponent from "@/components/productCard";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import RNFS from 'react-native-fs';

export default function DetailsScreen(){

    const { fileData, fileUri, fileName } = useLocalSearchParams();
    let [products, setProducts] = useState<Product[]>([]);
    let [initialProducts, setInitialProducts] = useState<Product[]>([]);
    let [refreshing, setRefreshing] = useState<boolean>(false);
    let [searchText, setSearchText] = useState<string>();
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [selectedPoduct, setSelectedProduct] = useState<Product>();
    let [selectedIndex, setSelectedIndex] = useState<Number>();


    //initialisation de la liste de produits lorsque le composant est monté
    useEffect( () => {

        let productsList = initProducts(fileData);
        setInitialProducts(productsList);
        setProducts(productsList);

    }, []);


    //Rechargement de la liste des produits lorsqu'on recharge l'écran
    const onRefresh = () => {

        setRefreshing(true);
        setInitialProducts(products);
        setTimeout(()=>{setRefreshing(false)}, 500);

    }


    //Formatage du contenu du fichier en un tableau de produit
    const initProducts = (data : string | string[]) => {

        data = (fileData.toString()).split(',');
        data = data.filter( item => item !== "" );
        // console.log(data);
            
        let products = [] as Product[];

        data.forEach( (line, index) => {

            let lineSplit = line.split(";");
            let name = lineSplit[1].slice(0, lineSplit[1].indexOf('(') -1);
            let cdt = lineSplit[1].slice(lineSplit[1].indexOf('('), lineSplit[1].length);
            let product = new Product(lineSplit[0], name, cdt, Number(lineSplit[2]));
    
            products.push(product);

        });
        console.log(products);

        return products;

    }


    //Filtre de la liste des produits en fonction de la valeur de recherche saisie
    const filterProducts = (key:string) => {
     
        if(key.length === 0){
            setInitialProducts(products);
            return;
        }

        let result = initialProducts.filter( (product) => {
            return (product.getName()).includes(key.toUpperCase());
        });
       
        setInitialProducts(result);
    }


    //Mis à jour de la quantité du produit selectionné avec la nouvelle valeur saisir
    const updateQuantity = (quantity: string) => {

        if(quantity.includes('.')){
            setTimeout(()=>1, 1000);
        }
        let product = new Product(selectedPoduct?.getId(), selectedPoduct?.getName(), selectedPoduct?.getCondtionment(), selectedPoduct?.getQuantity());

        product?.setQuantity(Number(quantity));

        setSelectedProduct(product);

        initialProducts.forEach((product) => {
            if( product.getId() == selectedPoduct?.getId()){
                product.setQuantity(Number(quantity));
                return;
            }
        });

        products.forEach((product, index) => {
            if( product.getId() == selectedPoduct?.getId()){
                product.setQuantity(Number(quantity));
                setSelectedIndex(index);
                return;
            }
        });
        
        // initialProducts[Number(selectedIndex)]?.setQuantity(Number(quantity));
        
        // products[Number(selectedIndex)]?.setQuantity(Number(quantity));
        // setInitialProducts(products);
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

    const saveInventoryToFile = async() => {
        let data = "";
        products.forEach( (product) => {
            data += product.getId() + ";" + product.getName() + product.getCondtionment() + ";" + product.getQuantity() + "\r\n";
        });
        FileSystem.writeAsStringAsync((fileUri).toString(), data)
            .then(response => console.log("success"))
            .catch(e => alert("Erreur lors de l'enregistrement !"));

        const newFileUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({from: fileUri.toString(), to: newFileUri});

        await Sharing.shareAsync((newFileUri).toString())
            .then(response => console.log(response))
            .catch(error => console.error(error));

        // let info = FileSystem.writeAsStringAsync('file:///data/user/0/Download', data);

        console.log(data);
        console.log(`${FileSystem.documentDirectory}${fileName}`);
        // console.log('aaaaaaaaaaaaaaaa',info);

        // const path = `${RNFS.DownloadDirectoryPath}${fileName}`;
        // await RNFS.writeFile('file:///data/user/0/Dowloads', data, 'utf8');
    }

    //Vue à afficher à l'écran
    return (
        
        <View style={ {paddingVertical: 20, paddingHorizontal:10, backgroundColor: "#eff5f7",} }>

            <Stack.Screen 
                options={{
                    headerRight: () => <Text onPress={saveInventoryToFile} style={styles.saveButton}> Enregistrer </Text> 
                }}
             />

            <TextInput 
                value={searchText}
                placeholder="Rechercher"
                selectTextOnFocus
                onChangeText={
                    (key) => {
                        setSearchText(key);
                        filterProducts(key);
                    }
                }
                style={styles.seachInput}
            > 
            </TextInput>

            <FlatList
                data={initialProducts} 
                renderItem={ 
                    ({item, index}) => <Text onPress={()=>{openModal(item, index)}} style={styles.productCard}> <ProductComponent product={item}/> </Text>
                }
                keyExtractor={(item) => item.getId()}
                contentContainerStyle = {styles.flatlistContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                style={styles.flatlist}
                showsVerticalScrollIndicator={ false } 
                ListFooterComponent={ () => <Text> Nombre de Produits: { initialProducts.length } / { products.length } </Text> }
                ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun produit trouvé ! </Text> }
                
            >
            </FlatList>

            <Modal transparent={ true } animationType="slide" visible={ modalVisible } onPointerLeave={ () => setModalVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} } behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <TouchableOpacity onPress={ closeModal } style={ styles.modalOverlay } activeOpacity={ 1 }>
                        <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                            <Ionicons name="checkmark-circle-outline" size={ 48 } color="#02c4ba" onPress={ closeModal } style={ styles.closeButton }></Ionicons>
                            <Text style={ {fontSize:20, color: "#0000009b", fontWeight: "bold"} }> { selectedPoduct?.getName() } </Text>
                            <Text style={ {fontSize:14, color: "#0000009b",} }> { selectedPoduct?.getCondtionment() } </Text>
                            <Text style={ {fontSize:14, color: "#0000009b", marginTop: 20,} }> Quantité: </Text>
                            <TextInput onBlur={ closeModal } placeholder="Quantité" value={ (selectedPoduct?.getQuantity())?.toString() } onChangeText={ (text) => {updateQuantity(text)} } selectTextOnFocus keyboardType="numeric" style={ styles.input } />
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
        borderRadius: 10,
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
    saveButton:{
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    }
})