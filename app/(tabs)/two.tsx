import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { exportarParaCSV, buscarDadosHoje } from "../../services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// FUNÇÃO DE FORMATAÇÃO (Máscara de Moeda)
const formatarMoeda = (value: string) => {
  if (!value) return "0,00";
  const cleanValue = value.replace(/\D/g, "");
  const numberValue = (Number(cleanValue) / 100).toFixed(2);
  return numberValue.replace(".", ",");
};

export default function TelaExportacao() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);
  const [novosPrecos, setNovosPrecos] = useState<string[]>([]);
  const [dados, setDados] = useState<any[]>([]);

  const carregarDados = useCallback(() => {
    buscarDadosHoje().then(setDados);
  }, []);

  useFocusEffect(carregarDados);

  const abrirEdicao = (item: any) => {
    setItemParaEditar(item);
    // Converte os números salvos (1.5) para o formato da máscara (1,50)
    setNovosPrecos(
      item.precos.map((p: number) => formatarMoeda((p * 100).toString()))
    );
    setModalVisivel(true);
  };

  const salvarAlteracao = async () => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const chave = `@pesquisa_${hoje}`;

      const precosNumericos = novosPrecos.map((p) => {
        const limpo = p.replace(/\./g, "").replace(",", ".");
        return parseFloat(limpo) || 0;
      });

      const novaLista = dados.map((item) => {
        if (item.produto === itemParaEditar.produto) {
          return { ...item, precos: precosNumericos };
        }
        return item;
      });

      await AsyncStorage.setItem(chave, JSON.stringify(novaLista));

      setModalVisivel(false);
      carregarDados();
      Alert.alert("Sucesso", "Preços atualizados!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const soma = item.precos.reduce((a: number, b: number) => a + b, 0);
    const media = (soma / item.precos.length).toFixed(2).replace(".", ",");

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.nomeProduto}>{item.produto.toUpperCase()}</Text>
          <Text style={styles.qtdAmostras}>{item.precos.length} amostras</Text>
          <TouchableOpacity
            style={styles.btnAlterar}
            onPress={() => abrirEdicao(item)}
          >
            <Ionicons name="pencil" size={14} color="#27ae60" />
            <Text style={styles.txtAlterar}>ALTERAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardMedia}>
          <Text style={styles.labelMedia}>MÉDIA</Text>
          <Text style={styles.valorMedia}>R$ {media}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {dados.length > 0 ? (
        <FlatList
          data={dados}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
        />
      ) : (
        <View style={styles.content}>
          <Ionicons name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.instrucao}>Nenhuma coleta hoje.</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Editar: {itemParaEditar?.produto}
            </Text>

            <ScrollView style={{ maxHeight: 350 }}>
              {novosPrecos.map((preco, index) => (
                <View key={index} style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Amostra {index + 1}:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={preco ? `R$ ${preco}` : ""}
                    onChangeText={(text) => {
                      const valorFormatado = formatarMoeda(text);
                      const updated = [...novosPrecos];
                      updated[index] = valorFormatado;
                      setNovosPrecos(updated);
                    }}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => setModalVisivel(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSalvarModal}
                onPress={salvarAlteracao}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.btnExportar,
            dados.length === 0 && styles.btnDesativado,
          ]}
          onPress={() => exportarParaCSV(dados)}
          disabled={dados.length === 0}
        >
          <Ionicons name="share-outline" size={24} color="white" />
          <Text style={styles.txtExportar}>Exportar para Excel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  listaContainer: { padding: 20, paddingBottom: 100 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  instrucao: { fontSize: 16, color: "#999", marginTop: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  cardInfo: { flex: 1, gap: 4 },
  nomeProduto: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  qtdAmostras: { fontSize: 12, color: "#7f8c8d" },
  cardMedia: { alignItems: "flex-end" },
  labelMedia: { fontSize: 10, fontWeight: "bold", color: "#95a5a6" },
  valorMedia: { fontSize: 18, fontWeight: "bold", color: "#27ae60" },
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
  },
  btnDesativado: { backgroundColor: "#ccc" },
  txtExportar: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  btnAlterar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  txtAlterar: {
    color: "#27ae60",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    minHeight: "50%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInputGroup: { marginBottom: 15 },
  modalLabel: { fontSize: 12, color: "#7f8c8d", marginBottom: 5 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnCancelar: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#eee",
    flex: 0.45,
    alignItems: "center",
  },
  btnSalvarModal: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#27ae60",
    flex: 0.45,
    alignItems: "center",
  },
});
