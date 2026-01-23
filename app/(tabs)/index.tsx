import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { salvarNoHistoricoDiario } from '@/services/storage';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";

// Mock de produtos (Em um app real, viria de uma API ou Banco Local)
const PRODUTOS_BASE = [
  { id: "1", nome: "Tomate Italiano", categoria: "Legumes" },
  { id: "2", nome: "Banana Prata", categoria: "Frutas" },
  { id: "3", nome: "Alface Crespa", categoria: "Verduras" },
];

export default function TelaPesquisaPrecos() {
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [produtoAtivo, setProdutoAtivo] = useState(null);

  // Inicialização do Formulário
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { amostras: [{ valor: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "amostras",
  });

  // --- Lógica de Busca ---
  const filtrarProdutos = (texto) => {
    setBusca(texto);
    if (texto.length > 1) {
      const filtrados = PRODUTOS_BASE.filter((p) =>
        p.nome.toLowerCase().includes(texto.toLowerCase())
      );
      setSugestoes(filtrados);
    } else {
      setSugestoes([]);
    }
  };

  const selecionarProduto = (produto) => {
    setProdutoAtivo(produto);
    setSugestoes([]);
    setBusca(produto.nome);
  };

  // --- Lógica de Salvamento ---
  const onSubmit = async (data) => {
    const sucesso = await salvarNoHistoricoDiario({
      nome: produtoAtivo.nome,
      coletas: data.amostras,
    });

    if (sucesso) {
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
            placeholder="Ex: Tomate..."
            value={busca}
            onChangeText={filtrarProdutos}
          />
          {produtoAtivo && (
            <TouchableOpacity onPress={() => setProdutoAtivo(null)}>
              <Ionicons name="close-circle" size={20} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA DE SUGESTÕES (DROPDOWN) */}
        {sugestoes.length > 0 && !produtoAtivo && (
          <View style={styles.dropdown}>
            {sugestoes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemSugestao}
                onPress={() => selecionarProduto(item)}
              >
                <Text style={styles.txtSugestao}>{item.nome}</Text>
                <Text style={styles.txtCat}>{item.categoria}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* SEÇÃO DE AMOSTRAS (SÓ APARECE SE HOUVER PRODUTO) */}
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
                    value={value}
                    onChangeText={onChange}
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
});
