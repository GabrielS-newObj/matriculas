const BASE = "http://localhost:3001";
 
async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(BASE + caminho, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Erro " + resposta.status);
  }
  return resposta.json();
}
 
export const api = {
  login: (email, senha) =>
    requisicao("/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  listar: (caminho) => requisicao("/" + caminho), 
  criar: (colecao, dados) =>
    requisicao("/" + colecao, { method: "POST", body: JSON.stringify(dados) }),
  atualizar: (colecao, id, dados) =>
    requisicao("/" + colecao + "/" + id, { method: "PUT", body: JSON.stringify(dados) }),
  remover: (colecao, id) => requisicao("/" + colecao + "/" + id, { method: "DELETE" }),
};
