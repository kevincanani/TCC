import { View, Image, StyleSheet } from "react-native";

export default function Home() {
    return(
        <View>
            <Image style={styles.img} source={require('../assets/ornitorrinco.png')}/>
        </View>
    );
}

const styles = StyleSheet.create({
    img:{
        width: 100,
        height: 200
    }
})