const http = require("http");
const fs = require("fs");
 
const ARQUIVO = "./db.json";
const COLECOES = ["alunos", "disciplinas", "professores", "turmas", "matriculas"];
const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
 
const ler = () => JSON.parse(fs.readFileSync(ARQUIVO, "utf-8"));
const gravar = (db) => fs.writeFileSync(ARQUIVO, JSON.stringify(db, null, 2));
 
function responder(res, status, corpo) {
  res.writeHead(status, CABECALHOS);
  res.end(JSON.stringify(corpo));
}
 
function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let texto = "";
    req.on("data", (parte) => (texto += parte));
    req.on("end", () => {
      try {
        resolve(texto ? JSON.parse(texto) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}
 
const normalizar = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
 
function proximoCodigo(db) {
  const maior = db.disciplinas.reduce((m, d) => {
    const achado = /^DISC-(\d+)$/.exec(String(d.codigo));
    return achado ? Math.max(m, Number(achado[1])) : m;
  }, 0);
  return "DISC-" + String(maior + 1).padStart(3, "0");
}
 
function validarServidor(recurso, novo, db, idAtual = null) {
  if (recurso === "disciplinas") {
    const nome = normalizar(novo.nome);
    if (!nome) return "Preencha o nome da disciplina.";
    const repetida = db.disciplinas.some((d) => d.id !== idAtual && normalizar(d.nome) === nome);
    if (repetida) return "Já existe uma disciplina com este nome.";
  }
  if (recurso === "turmas") {
    if (!Number.isInteger(novo.vagas) || novo.vagas < 1)
      return "Vagas deve ser um número inteiro maior ou igual a 1.";
    const prof = db.professores.find((p) => p.id === novo.professorId);
    if (!prof) return "Professor não encontrado.";
    const turmasProf = db.turmas.filter((t) => t.professorId === prof.id);
    if (turmasProf.some((t) => t.horario === novo.horario))
      return "O professor já tem turma neste horário.";
    if (turmasProf.length >= prof.limiteTurmas)
      return "O professor atingiu o limite de turmas.";
  }
  if (recurso === "matriculas") {
    const turma = db.turmas.find((t) => t.id === novo.turmaId);
    const aluno = db.alunos.find((a) => a.id === novo.alunoId);
    if (!turma || !aluno) return "Aluno ou turma não encontrados.";
    const disc = db.disciplinas.find((d) => d.id === turma.disciplinaId);
    if (disc.preRequisitos.some((id) => !aluno.disciplinasConcluidas.includes(id)))
      return "Pré-requisitos não cumpridos.";
    const ocupadas = db.matriculas.filter((m) => m.turmaId === turma.id).length;
    if (ocupadas >= turma.vagas) return "Turma sem vagas.";
    const minhas = db.matriculas
      .filter((m) => m.alunoId === aluno.id)
      .map((m) => db.turmas.find((t) => t.id === m.turmaId))
      .filter(Boolean);
    if (minhas.some((t) => t.horario === turma.horario)) return "Conflito de horário.";
    if (minhas.some((t) => t.disciplinaId === turma.disciplinaId))
      return "Já matriculado nesta disciplina.";
  }
  return null;
}
 
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CABECALHOS);
    return res.end();
  }
  const url = new URL(req.url, "http://localhost");
  const [recurso, idTexto] = url.pathname.split("/").filter(Boolean);
  const id = idTexto ? Number(idTexto) : null;
 
  try {
    const db = ler();
 
    if (req.method === "POST" && recurso === "login") {
      const { email, senha } = await lerCorpo(req);
      const usuario = db.usuarios.find((u) => u.email === email && u.senha === senha);
      if (!usuario) return responder(res, 401, { mensagem: "E-mail ou senha inválidos." });
      const { senha: _omitida, ...semSenha } = usuario;
      return responder(res, 200, semSenha);
    }
 
    if (COLECOES.includes(recurso)) {
      const lista = db[recurso];
 
      if (req.method === "GET") {
        if (id !== null) {
          const item = lista.find((i) => i.id === id);
          return item ? responder(res, 200, item) : responder(res, 404, { mensagem: "Não encontrado." });
        }
        let resultado = lista;
        for (const [chave, valor] of url.searchParams)
          resultado = resultado.filter((i) => String(i[chave]) === valor);
        return responder(res, 200, resultado);
      }

      if (req.method === "POST") {
        const novo = await lerCorpo(req);
        const erro = validarServidor(recurso, novo, db);
        if (erro) return responder(res, 400, { mensagem: erro });
        if (recurso === "disciplinas") {
          novo.nome = String(novo.nome).trim();
          novo.codigo = proximoCodigo(db);
        }
        novo.id = Math.max(0, ...lista.map((i) => i.id)) + 1;
        lista.push(novo);
        gravar(db);
        return responder(res, 201, novo);
      }
 
      if (req.method === "PUT" && id !== null) {
        const pos = lista.findIndex((i) => i.id === id);
        if (pos < 0) return responder(res, 404, { mensagem: "Não encontrado." });
        const atualizado = { ...lista[pos], ...(await lerCorpo(req)), id };
        if (recurso === "disciplinas") {
          atualizado.codigo = lista[pos].codigo;
          const erro = validarServidor(recurso, atualizado, db, id);
          if (erro) return responder(res, 400, { mensagem: erro });
        }
        lista[pos] = atualizado;
        gravar(db);
        return responder(res, 200, lista[pos]);
      }
 
      if (req.method === "DELETE" && id !== null) {
        db[recurso] = lista.filter((i) => i.id !== id);
        if (recurso === "turmas") 
          db.matriculas = db.matriculas.filter((m) => m.turmaId !== id);
        if (recurso === "disciplinas") {
          const idsTurmas = db.turmas.filter((t) => t.disciplinaId === id).map((t) => t.id);
          db.turmas = db.turmas.filter((t) => t.disciplinaId !== id);
          db.matriculas = db.matriculas.filter((m) => !idsTurmas.includes(m.turmaId));
          db.disciplinas.forEach((d) => {
          d.preRequisitos = d.preRequisitos.filter((p) => p !== id);
        });
          // Sem isso, o id removido ficaria "concluído" nos alunos e, se um novo id igual
          // fosse criado, o aluno passaria por pré-requisitos que nunca cumpriu.
          db.alunos.forEach((a) => {
            a.disciplinasConcluidas = a.disciplinasConcluidas.filter((c) => c !== id);
          });
        }
        gravar(db);
        return responder(res, 200, { mensagem: "Removido." });
      }
    }
 
    responder(res, 404, { mensagem: "Rota não encontrada." });
  } catch (e) {
    responder(res, 500, { mensagem: "Erro no servidor." });
  }
});
 
server.listen(3001, () => console.log("API rodando em http://localhost:3001"));
