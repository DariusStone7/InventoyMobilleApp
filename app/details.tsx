import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Pressable, TouchableOpacity, Dimensions, Modal, KeyboardAvoidingView, Platform} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from "react";
import Product from "@/models/Product";
import ProductComponent from "@/components/productCard";
import { RefreshControl } from "react-native-gesture-handler";
import modal from "@/components/modal";
import { Ionicons } from "@expo/vector-icons";


export default function DetailsScreen(){

    const { fileData } = useLocalSearchParams();
    const [fileLines, setFileLines] = useState<string[]>([]);
    let [products, setProducts] = useState<Product[]>([]);
    let [initialProducts, setInitialProducts] = useState<Product[]>([]);
    let [refreshing, setRefreshing] = useState<boolean>(false);
    let [searchText, setSearchText] = useState<string>();
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [selectedPoduct, setSelectedProduct] = useState<Product>();
    let [selectedIndex, setSelectedIndex] = useState<Number>();

    // let lines = (fileData.toString()).split("\n");
    // console.log(lines);
    // let initialProducts = [] as Product[]

    let lines = [
        'CDT1;LAIT BROLI CHOCOLOCO PULS TROIS 1KG(CARTON);15',
        'CDT2;BISCUIT NAYA 150G(PAQUET);4',
        'CDT3;EAU SUPERMONT 10L(BIDON);4',
        'CDT4;LAIT BROLI 1KG(CARTON);23',
        'CDT5;BISCUIT NAYA 150G(PAQUET);5',
        'CDT6;EAU SUPERMONT 10L(BIDON);12',
        'CDT7;LAIT BROLI 1KG(CARTON);23',
        'CDT8;BISCUIT NAYA 150G(PAQUET);5',
        'CDT9;EAU SUPERMONT 10L(BIDON);12',
        'CDT10;LAIT BROLI 1KG(CARTON);23',
        'CDT11;BISCUIT NAYA 150G(PAQUET);5',
        'CDT12;EAU SUPERMONT 10L(BIDON);12',
        'CDT13;LAIT BROLI 1KG(CARTON);23',
        'CDT14;BISCUIT NAYA 150G(PAQUET);5',
        'CDT15;EAU SUPERMONT 10L(BIDON);12',
    ];


    //initialisation de la liste de produits lorsque le composant est monté
    useEffect( () => {

        let productsList = initProducts(lines);
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
    const initProducts = (lines : String[]) => {

        let products = [] as Product[];

        lines.forEach( (line, index) => {

            let lineSplit = line.split(";");
            let namecdt = lineSplit[1].split('(');
            let product = new Product(lineSplit[0], namecdt[0], '('+namecdt[1], Number(lineSplit[2]));
    
            products.push(product);

        });

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

        let product = new Product(selectedPoduct?.getId(), selectedPoduct?.getName(), selectedPoduct?.getCondtionment(), selectedPoduct?.getQuantity());

        product?.setQuantity(Number(quantity));

        setSelectedProduct(product);

        initialProducts[Number(selectedIndex)]?.setQuantity(Number(quantity));
        setInitialProducts(initialProducts);
        setProducts(initialProducts);

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


    //Vue à afficher à l'écran
    return (
        <View style={ {paddingVertical: 20, paddingHorizontal:10, backgroundColor: "#eff5f7",} }>
            <TextInput 
                value={searchText}
                placeholder="Rechercher"
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
                ListFooterComponent={ () => <Text> Nombre de Produits: { products.length } </Text> }
                ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun produit trouvé ! </Text> }
                
            >
            </FlatList>

            <Modal transparent={ true } animationType="slide" visible={ modalVisible } onPointerLeave={ () => setModalVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} }>
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
       height: "35%",
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
    }
})