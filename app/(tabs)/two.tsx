import React, { useState, useCallback } from "react"; // hooks
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router"; // Para atualizar os dados
import { exportarParaCSV, buscarDadosHoje } from "../../services/storage";

export default function TelaExportacao() {
  const [dados, setDados] = useState([]);

  // Importante: Precisamos buscar os dados para poder exportá-los!
  useFocusEffect(
    useCallback(() => {
      buscarDadosHoje().then(setDados);
    }, [])
  );

  // comando 'return' para renderizar a interface (sem ele não funciona)
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.instrucao}>
          Clique abaixo para gerar o relatório consolidado de hoje.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnExportar}
          onPress={() => exportarParaCSV(dados)}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color="white" />
          <Text style={styles.txtExportar}>Exportar para Excel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  instrucao: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  btnExportar: {
    backgroundColor: "#1d6f42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  txtExportar: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
