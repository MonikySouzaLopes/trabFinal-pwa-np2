import { openDB } from "idb";
let db;

async function createDB( ) {
    try{
        db = await openDB('banco', 1 , {
            upgrade(db, oldeVersion, newVersion, transaction){
                switch(oldeVersion){
                    case 0:
                    case 1: 
                        const store = db.createObjectStore('pessoas', {
                            //a propriedade nome será o campo chave
                            keyPath:'nome'
                        });
                        //crinado um indice id na store, deve estar contido no objeto do banco.
                        store.createIndex('id','id');
                        showResult('Banco de dados criado!');
                }
            }
        });
        showResult('Banco de dados aberto');
    }catch (e) {
        showResult('Erro ao criar o banco de dados: '+ e.message)
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    createDB();
    document.getElementById('input');
    document.getElementById('btnSalvar').addEventListener('click', addData);
    document.getElementById('btnListar').addEventListener('click', getData);
})

async function addData(nome) {
    if (!db) {
        console.error("O banco de dados ainda não foi inicializado.");
        return;
    }
    const tx = db.transaction('compras', 'readwrite');
    const store = tx.objectStore('compras');
    try {
        await store.add({ nome });
        await tx.done;
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
    }
}

async function getData() {
    if (!db) {
        console.error("O banco de dados está fechado");
        return [];
    }
    const tx = db.transaction('compras', 'readonly');
    const store = tx.objectStore('compras');
    return await store.getAll();
}

async function remover(id) {
    if (!db) {
        console.error("O banco de dados ainda não foi inicializado.");
        return;
    }
    const tx = db.transaction('compras', 'readwrite');
    const store = tx.objectStore('compras');
    try {
        await store.delete(id);
        await tx.done;
        console.log('Registro removido com sucesso!');
    } catch (error) {
        console.error('Erro ao remover registro:', error);
    }
}

// Inicializa o banco de dados ao carregar o script
createDB();

// Exportando funções para serem usadas em main.js
export { addData, getData, remover };
