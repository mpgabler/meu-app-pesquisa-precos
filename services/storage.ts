import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export const salvarNoHistoricoDiario = async (novaColeta) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const chave = `@pesquisa_${hoje}`;

    const dadosExistentes = await AsyncStorage.getItem(chave);
    let listaAtualizada = dadosExistentes ? JSON.parse(dadosExistentes) : [];

    // 1. TRATAMENTO SÊNIOR: Processamos os preços uma única vez aqui
    const novosPrecosTratados = novaColeta.coletas.map((c) => {
      // Remove qualquer caractere que não seja número (ex: "R$ 12,50" vira "1250")
      const numeroLimpo = c.valor.replace(/\D/g, "");
      // Transforma em decimal real (ex: "1250" vira 12.5)
      return parseFloat(numeroLimpo) / 100;
    });

    const index = listaAtualizada.findIndex(
      (item) => item.produto === novaColeta.nome
    );

    if (index !== -1) {
      // Se o produto já existe, adicionamos os novos preços ao array que já está lá
      listaAtualizada[index].precos.push(...novosPrecosTratados);
    } else {
      // Se o produto é novo, criamos a entrada com os preços já tratados
      listaAtualizada.push({
        produto: novaColeta.nome,
        precos: novosPrecosTratados,
      });
    }

    await AsyncStorage.setItem(chave, JSON.stringify(listaAtualizada));
    return true;
  } catch (e) {
    console.error("Erro ao salvar:", e);
    return false;
  }
};

// Função auxiliar para buscar os dados (útil para sua tabela)
export const buscarDadosHoje = async () => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const dados = await AsyncStorage.getItem(`@pesquisa_${hoje}`);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return [];
  }
};

export const exportarParaCSV = async (dados: any[]) => {
  if (dados.length === 0) return;

  // 1. Gerar o conteúdo do CSV (Mantemos igual)
  let csvContent = "PRODUTO;";
  for (let i = 1; i <= 10; i++) csvContent += `AMOSTRA ${i};`;
  csvContent += "\n";

  dados.forEach((item) => {
    let linha = `${item.produto.toUpperCase()};`;
    for (let i = 0; i < 10; i++) {
      const preco = item.precos[i];
      const precoFormatado = preco ? preco.toFixed(2).replace(".", ",") : "";
      linha += `${precoFormatado};`;
    }
    csvContent += linha + "\n";
  });

  // 2. Lógica de Download/Compartilhamento
  if (Platform.OS === "web") {
    // --- LÓGICA PARA NAVEGADOR (PWA) ---
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pesquisa_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // --- LÓGICA PARA CELULAR (NATIVO) ---
    const fileName = `pesquisa_${new Date().getTime()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Erro ao exportar no celular:", error);
    }
  }
};

// Gerenciamento de Produtos Favoritos
const FAVORITOS_KEY = '@produtos_frequentes';

export const registrarUsoProduto = async (nomeProduto: string) => {
  try {
    const dados = await AsyncStorage.getItem(FAVORITOS_KEY);
    let frequencia = dados ? JSON.parse(dados) : {};

    // Incrementa o contador do produto
    frequencia[nomeProduto] = (frequencia[nomeProduto] || 0) + 1;

    await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(frequencia));
  } catch (e) {
    console.error("Erro ao registrar favorito:", e);
  }
};

export const buscarFavoritos = async () => {
  try {
    const dados = await AsyncStorage.getItem(FAVORITOS_KEY);
    if (!dados) return [];

    const frequencia = JSON.parse(dados);
    // Transforma em array, ordena pelos mais usados e pega os top 5
    return Object.keys(frequencia)
      .sort((a, b) => frequencia[b] - frequencia[a])
      .slice(0, 5);
  } catch (e) {
    return [];
  }
};
