import AsyncStorage from "@react-native-async-storage/async-storage";

export const salvarNoHistoricoDiario = async (novaColeta) => {
  try {
    // Definimos a chave com a data de hoje (ex: @pesquisa_2026-01-23)
    const hoje = new Date().toISOString().split("T")[0];
    const chave = `@pesquisa_${hoje}`;

    const dadosExistentes = await AsyncStorage.getItem(chave);
    let listaAtualizada = dadosExistentes ? JSON.parse(dadosExistentes) : [];

    const index = listaAtualizada.findIndex(
      (item) => item.produto === novaColeta.nome
    );

    if (index !== -1) {
      // Adiciona apenas os valores numéricos das novas amostras
      const novosPrecos = novaColeta.coletas.map((c) =>
        parseFloat(c.valor.replace(",", "."))
      );
      listaAtualizada[index].precos.push(...novosPrecos);
    } else {
      listaAtualizada.push({
        produto: novaColeta.nome,
        precos: novaColeta.coletas.map((c) =>
          parseFloat(c.valor.replace(",", "."))
        ),
      });
    }

    await AsyncStorage.setItem(chave, JSON.stringify(listaAtualizada));
    return true;
  } catch (e) {
    console.error("Erro ao salvar:", e);
    return false;
  }
};
