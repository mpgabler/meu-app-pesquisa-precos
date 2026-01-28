export const formatarMoeda = (value: string) => {
  if (!value) return "";
  
  // Remove tudo que não é dígito
  const apenasNumeros = value.replace(/\D/g, "");
  
  // Converte para número e divide por 100 para ter as duas casas decimais
  const valorNumerico = (Number(apenasNumeros) / 100).toFixed(2);
  
  // Formata para o padrão brasileiro: substitui ponto por vírgula
  return valorNumerico.replace(".", ",");
};