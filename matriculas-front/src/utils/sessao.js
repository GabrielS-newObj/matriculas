const CHAVE_USUARIO = "matriculas.usuario";
const CHAVE_PAGINA = "matriculas.pagina";
 
// localStorage pode falhar (modo privado, armazenamento bloqueado): nunca quebrar o sistema por isso.
function ler(chave) {
  try {
    return window.localStorage.getItem(chave);
  } catch (e) {
    return null;
  }
}
 
function guardar(chave, valor) {
  try {
    window.localStorage.setItem(chave, valor);
  } catch (e) {}
}
 
function remover(chave) {
  try {
    window.localStorage.removeItem(chave);
  } catch (e) {}
}
 
function usuarioValido(usuario) {
  if (!usuario || typeof usuario !== "object") return false;
  if (usuario.perfil === "gestor") return true;
  return usuario.perfil === "aluno" && usuario.alunoId !== undefined;
}
 
export function lerUsuario() {
  const texto = ler(CHAVE_USUARIO);
  if (!texto) return null;
  try {
    const usuario = JSON.parse(texto);
    return usuarioValido(usuario) ? usuario : null;
  } catch (e) {
    return null;
  }
}
 
export const salvarUsuario = (usuario) => guardar(CHAVE_USUARIO, JSON.stringify(usuario));
export const lerPagina = () => ler(CHAVE_PAGINA);
export const salvarPagina = (pagina) => guardar(CHAVE_PAGINA, pagina);
 
export function limparSessao() {
  remover(CHAVE_USUARIO);
  remover(CHAVE_PAGINA);
}
