import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Pressable, TouchableOpacity, Dimensions, Modal, } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from "react";
import Product from "@/models/Product";
import ProductComponent from "@/components/product";
import { RefreshControl } from "react-native-gesture-handler";
import modal from "@/components/modal";
import { Ionicons } from "@expo/vector-icons";

export default function DetailsScreen(){

    const { fileData } = useLocalSearchParams();
    const [fileLines, setFileLines] = useState<string[]>([]);
    let [products, setProducts] = useState<Product[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedPoduct, setSelectedProduct] = useState<Product>();
    const [selectedIndex, setSelectedIndex] = useState<Number>();

    // let lines = (fileData.toString()).split("\n");
    // console.log(lines);
    let initialProducts = [] as Product[];

    let lines = [
        'CDT1;LAIT BROLI CHOCOLOCO PULS TROIS 1KG(CARTON);15',
        'CDT2;BISCUIT NAYA 150G(PAQUET);4',
        'CDT3;EAU SUPERMONT 10L(BIDON);4',
        'CDT1;LAIT BROLI 1KG(CARTON);23',
        'CDT2;BISCUIT NAYA 150G(PAQUET);5',
        'CDT3;EAU SUPERMONT 10L(BIDON);12',
        'CDT1;LAIT BROLI 1KG(CARTON);23',
        'CDT2;BISCUIT NAYA 150G(PAQUET);5',
        'CDT3;EAU SUPERMONT 10L(BIDON);12',
        'CDT1;LAIT BROLI 1KG(CARTON);23',
        'CDT2;BISCUIT NAYA 150G(PAQUET);5',
        'CDT3;EAU SUPERMONT 10L(BIDON);12',
        'CDT1;LAIT BROLI 1KG(CARTON);23',
        'CDT2;BISCUIT NAYA 150G(PAQUET);5',
        'CDT3;EAU SUPERMONT 10L(BIDON);12',
    ];

    lines.forEach((line, index)=>{
        let lineSplit = line.split(";");
        let namecdt = lineSplit[1].split('(');

        let product = new Product(lineSplit[0], namecdt[0], '('+namecdt[1], Number(lineSplit[2]));

        initialProducts[index] = new Product(lineSplit[0], namecdt[0], '('+namecdt[1], Number(lineSplit[2]));
    });

    // let initialProducts = [
    //     new Product("CDT1", "LAIT BROLI CHOCOLOCO PULS TROIS 1KG", "CARTON", 15),
    //     new Product("CDT2", "BISCUIT NAYA 150G", "PAQUET", 4),
    //     new Product("CDT3", "EAU SUPERMONT 10L", "BIDON", 4),
    //     new Product("CDT4", "LAIT BROLI 1KG", "CARTON", 4),
    //     new Product("CDT5", "BISCUIT NAYA 150G", "PAQUET", 4),
    //     new Product("CDT6", "EAU SUPERMONT 10L", "BIDON", 4),
    //     new Product("CDT7", "LAIT BROLI 1KG", "CARTON", 4),
    //     new Product("CDT8", "BISCUIT NAYA 150G", "PAQUET", 4),
    //     new Product("CDT9", "EAU SUPERMONT 10L", "BIDON", 4),
    //     new Product("CDT10", "LAIT BROLI 1KG", "CARTON", 4),
    //     new Product("CDT11", "BISCUIT NAYA 150G", "PAQUET", 4),
    //     new Product("CDT12", "EAU SUPERMONT 10L", "BIDON", 4),
    //     new Product("CDT13", "LAIT BROLI 1KG", "CARTON", 4),
    //     new Product("CDT14", "BISCUIT NAYA 150G", "PAQUET", 4),
    //     new Product("CDT15", "EAU SUPERMONT 10L", "BIDON", 4),
    // ];

    //initialisation de la liste de produits lorsque le composant est monté
    useEffect(() => {
        setProducts(initialProducts);
        setModalVisible(false);
    }, []);

    //Rechargement de la liste des produits lorsqu'on recharge l'écran
    const onRefresh = ()=>{
        setRefreshing(true);
        setProducts(initialProducts);
        setModalVisible(false);
        setTimeout(()=>{setRefreshing(false)}, 1000);
    }

    //Filtre de la liste des produits en fonction de la valeur de recherche saisie
    const filterProducts = (key:string)=>{
        console.log(key);
        let result = initialProducts.filter((product)=>{
            return (product.getName()).includes(key.toUpperCase());
        });
        setProducts(result);
        console.log(products);
    }

    const updateQuantity = (quantity: string) => {

        selectedPoduct?.setQuantity(Number(quantity));
        setSelectedProduct(selectedPoduct);

        initialProducts[Number(selectedIndex)]?.setQuantity(Number(quantity));
        setProducts(initialProducts);

    }

    const openModal = (product : Product, index: Number) => {
        setSelectedProduct(product);
        setSelectedIndex(index);

        setModalVisible(true);

        return null;
    }

    const closeModal = ()=> {
        setModalVisible(false);
        console.log(products[Number(selectedIndex)]);

    }

    return (
        <View style={{paddingVertical: 20, paddingHorizontal:10, backgroundColor: "#eff5f7",}}>
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
                data={products} 
                renderItem={ 
                    ({item, index}) => <Text onPress={()=>{openModal(item, index)}} style={styles.productCard}> <ProductComponent product={item}/> </Text>
                }
                keyExtractor={(item) => item.getId()}
                style={styles.flatlist}
                contentContainerStyle = {styles.flatlistContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                // refreshControl={
                //     <RefreshControl 
                //         refreshing={refreshing} 
                //         onRefresh={onRefresh} 
                //         title="Chargement..."
                //         tintColor="red"
                //     />
                // }
                showsVerticalScrollIndicator={false}

                ListFooterComponent={()=><Text>Nombre de Produits: {products.length}</Text>}

                ListEmptyComponent={()=><Text style={{color: "#ff9900"}}>Aucun produit trouvé !</Text>}
                
            >
            </FlatList>

            <Modal transparent={true} animationType="slide" visible={modalVisible} onPointerLeave={()=>setModalVisible(false)}>
                <View style={styles.modal}>
                    <Ionicons name="close-circle" size={48} color="#fff" onPress={closeModal} style={styles.closeButton}></Ionicons>
                    <Text> {selectedPoduct?.getName()} </Text>
                    <Text> {selectedPoduct?.getCondtionment()} </Text>
                    <TextInput placeholder="Quantité" value={(selectedPoduct?.getQuantity())?.toString()} onChangeText={(text)=>{updateQuantity(text)}} selectTextOnFocus keyboardType="numeric" style={styles.input} ></TextInput>
                </View>
            </Modal>

        </View>

    )
}

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
       height: "30%",
       position: "absolute",
       bottom: 0,
       borderTopRightRadius: 25,
       borderTopLeftRadius: 25,
       paddingHorizontal: 20,
       paddingVertical: 30,
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
        marginTop: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    }
})