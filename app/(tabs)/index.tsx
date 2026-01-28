import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { salvarNoHistoricoDiario } from "@/services/storage";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { formatarMoeda } from "@/utilitarios/formataMoeda";
import { ROL_PRODUTOS } from "@/constants/Produtos"; // Agora usando seu rol completo
import { registrarUsoProduto, buscarFavoritos } from "@/services/storage";
import { useFocusEffect } from "expo-router";

export default function TelaPesquisaPrecos() {
  const [busca, setBusca] = useState("");
  const [produtoAtivo, setProdutoAtivo] = useState(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  // Buscar favoritos ao focar na tela
  useFocusEffect(
    useCallback(() => {
      buscarFavoritos().then(setFavoritos);
    }, [])
  );

  // Inicialização do Formulário
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { amostras: [{ valor: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "amostras",
  });

  // --- Lógica de Busca Otimizada (Sênior) ---
  // Usamos useMemo para que o filtro só rode quando o texto da 'busca' mudar
  const sugestoes = useMemo(() => {
    if (busca.length < 2 || produtoAtivo) return [];

    // Normaliza o texto (remove acentos e deixa minúsculo)
    const termoNormalizado = busca
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return ROL_PRODUTOS.filter((item) => {
      const itemNormalizado = item
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return itemNormalizado.includes(termoNormalizado);
    }).slice(0, 10); // Limita a 10 itens para performance
  }, [busca, produtoAtivo]);

  const selecionarProduto = (nomeProduto) => {
    // Como seu ROL_PRODUTOS é uma lista de strings, o 'produto' aqui é o nome
    setProdutoAtivo({ nome: nomeProduto });
    setBusca(nomeProduto);
    Keyboard.dismiss();
  };

  // --- Lógica de Salvamento ---
  const onSubmit = async (data) => {
    const sucesso = await salvarNoHistoricoDiario({
      nome: produtoAtivo.nome,
      coletas: data.amostras,
    });

    if (sucesso) {
      await registrarUsoProduto(produtoAtivo.nome); // Registra que este produto foi usado
      Alert.alert("Sucesso", "Dados salvos na tabela diária!");
      setProdutoAtivo(null);
      setBusca("");
      reset({ amostras: [{ valor: "" }] });
    } else {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Nova Coleta</Text>

      {/* SEÇÃO DE BUSCA */}
      <View style={styles.secaoBusca}>
        <Text style={styles.label}>Produto</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.inputBusca}
            placeholder="Digite para buscar no rol..."
            value={busca}
            onChangeText={setBusca} // Agora altera apenas o estado 'busca'
          />
          {produtoAtivo && (
            <TouchableOpacity
              onPress={() => {
                setProdutoAtivo(null);
                setBusca("");
              }}
            >
              <Ionicons name="close-circle" size={20} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>
         {/* SEÇÃO DE FAVORITOS */}
        {busca.length === 0 && favoritos.length > 0 && !produtoAtivo && (
          <View style={styles.secaoFavoritos}>
            <Text style={styles.labelFavoritos}>
              Frequentemente pesquisados:
            </Text>
            <View style={styles.rowFavoritos}>
              {favoritos.map((fav, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chipFavorito}
                  onPress={() => selecionarProduto(fav)}
                >
                  <Text style={styles.txtChip}>{fav.split(" ")[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* LISTA DE SUGESTÕES DINÂMICA */}
        {sugestoes.length > 0 && (
          <View style={styles.dropdown}>
            {sugestoes.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemSugestao}
                onPress={() => selecionarProduto(item)}
              >
                <Text style={styles.txtSugestao}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* SEÇÃO DE AMOSTRAS */}
      {produtoAtivo && (
        <View style={styles.secaoPrecos}>
          <Text style={styles.subtitulo}>
            Amostras de Preço para {produtoAtivo.nome}
          </Text>

          {fields.map((field, index) => (
            <View key={field.id} style={styles.rowAmostra}>
              <Controller
                control={control}
                name={`amostras.${index}.valor`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.inputPreco}
                    placeholder="R$ 0,00"
                    keyboardType="numeric"
                    value={value ? `R$ ${formatarMoeda(value)}` : ""}
                    onChangeText={(text) => {
                      const cleanValue = text.replace(/\D/g, "");
                      onChange(cleanValue);
                    }}
                  />
                )}
              />
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => remove(index)}
                  style={styles.btnTrash}
                >
                  <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => append({ valor: "" })}
          >
            <Ionicons name="add" size={20} color="#27ae60" />
            <Text style={styles.txtBtnAdd}>Adicionar Amostra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSalvar}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.txtWhite}>Salvar Coleta</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
    marginTop: 40,
  },
  secaoBusca: { zIndex: 100 },
  label: { fontSize: 14, color: "#7f8c8d", marginBottom: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dcdde1",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputBusca: { flex: 1, paddingVertical: 12, fontSize: 16 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemSugestao: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  txtSugestao: { fontSize: 16, fontWeight: "500" },
  txtCat: { fontSize: 12, color: "#95a5a6" },
  secaoPrecos: { marginTop: 30 },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
  },
  rowAmostra: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  inputPreco: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dcdde1",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  btnTrash: { marginLeft: 10 },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  txtBtnAdd: { color: "#27ae60", fontWeight: "bold", marginLeft: 5 },
  btnSalvar: {
    backgroundColor: "#2ecc71",
    padding: 18,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  txtWhite: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  secaoFavoritos: { marginTop: 15 },
  labelFavoritos: {
    fontSize: 12,
    color: "#95a5a6",
    marginBottom: 8,
    fontWeight: "bold",
  },
  rowFavoritos: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipFavorito: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  txtChip: { color: "#2e7d32", fontSize: 13, fontWeight: "500" },
});
