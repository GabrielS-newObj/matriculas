export function validarMatricula({ aluno, turma, disciplina, disciplinas = [], turmasDoAluno, ocupadas }) {
  if (!disciplina) return "Disciplina da turma não encontrada.";
 
  if (aluno.disciplinasConcluidas.includes(disciplina.id))
    return "Você já concluiu esta disciplina.";
 
  if (turmasDoAluno.some((t) => t.disciplinaId === turma.disciplinaId))
    return "Você já está matriculado nesta disciplina.";
 
  const faltando = disciplina.preRequisitos.filter(
    (id) => !aluno.disciplinasConcluidas.includes(id)
  );
  if (faltando.length > 0) {
    const nomes = faltando.map((id) => {
      const d = disciplinas.find((x) => x.id === id);
      return d ? d.nome : "disciplina " + id;
    });
    return "Pré-requisitos não cumpridos: " + nomes.join(", ") + ".";
  }
 
  if (turmasDoAluno.some((t) => t.horario === turma.horario))
    return "Conflito de horário com outra turma sua.";
 
  if (ocupadas >= turma.vagas) return "Turma sem vagas.";
 
  return null; 
}
 
export function validarOferta({ professor, turmasDoProfessor, horario }) {
  if (turmasDoProfessor.some((t) => t.horario === horario))
    return "O professor já tem turma neste horário.";
  if (turmasDoProfessor.length >= professor.limiteTurmas)
    return "O professor atingiu o limite de turmas.";
  return null;
}

