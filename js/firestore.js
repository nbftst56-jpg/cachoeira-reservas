// Firestore Database Module
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global data arrays (will be populated from Firestore)
window.reservas = [];
window.contatos = [];
window.limpezas = [];
window.manutencoes = [];

// Load all data from Firestore
async function loadAllData() {
  try {
    console.log('📥 Loading data from Firestore...');
    
    // Load reservas
    const reservasSnapshot = await getDocs(collection(window.db, 'reservas'));
    window.reservas = [];
    reservasSnapshot.forEach(docSnap => {
      window.reservas.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`✅ Loaded ${window.reservas.length} reservas`);
    
    // Load contatos
    const contatosSnapshot = await getDocs(collection(window.db, 'contatos'));
    window.contatos = [];
    contatosSnapshot.forEach(docSnap => {
      window.contatos.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`✅ Loaded ${window.contatos.length} contatos`);
    
    // Load limpezas
    const limpezasSnapshot = await getDocs(collection(window.db, 'limpezas'));
    window.limpezas = [];
    limpezasSnapshot.forEach(docSnap => {
      window.limpezas.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`✅ Loaded ${window.limpezas.length} limpezas`);
    
    // Load manutencoes
    const manutencoesSnapshot = await getDocs(collection(window.db, 'manutencoes'));
    window.manutencoes = [];
    manutencoesSnapshot.forEach(docSnap => {
      window.manutencoes.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`✅ Loaded ${window.manutencoes.length} manutenções`);
    
    // Update UI
    if (typeof updateAllUI === 'function') {
      updateAllUI();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading data:', error);
    alert('Erro ao carregar dados. Verifique sua conexão.');
    return false;
  }
}

// RESERVAS Functions
async function addReserva(reservaData) {
  try {
    const docRef = await addDoc(collection(window.db, 'reservas'), {
      ...reservaData,
      createdAt: Timestamp.now()
    });
    console.log('✅ Reserva added:', docRef.id);
    await loadAllData();
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding reserva:', error);
    throw error;
  }
}

async function updateReserva(id, reservaData) {
  try {
    await updateDoc(doc(window.db, 'reservas', id), {
      ...reservaData,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Reserva updated:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error updating reserva:', error);
    throw error;
  }
}

async function deleteReserva(id) {
  try {
    await deleteDoc(doc(window.db, 'reservas', id));
    console.log('✅ Reserva deleted:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error deleting reserva:', error);
    throw error;
  }
}

// CONTATOS Functions
async function addContato(contatoData) {
  try {
    const docRef = await addDoc(collection(window.db, 'contatos'), {
      ...contatoData,
      createdAt: Timestamp.now()
    });
    console.log('✅ Contato added:', docRef.id);
    await loadAllData();
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding contato:', error);
    throw error;
  }
}

async function updateContato(id, contatoData) {
  try {
    await updateDoc(doc(window.db, 'contatos', id), {
      ...contatoData,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Contato updated:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error updating contato:', error);
    throw error;
  }
}

async function deleteContato(id) {
  try {
    await deleteDoc(doc(window.db, 'contatos', id));
    console.log('✅ Contato deleted:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error deleting contato:', error);
    throw error;
  }
}

// LIMPEZAS Functions
async function addLimpeza(limpezaData) {
  try {
    const docRef = await addDoc(collection(window.db, 'limpezas'), {
      ...limpezaData,
      createdAt: Timestamp.now()
    });
    console.log('✅ Limpeza added:', docRef.id);
    await loadAllData();
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding limpeza:', error);
    throw error;
  }
}

async function deleteLimpeza(id) {
  try {
    await deleteDoc(doc(window.db, 'limpezas', id));
    console.log('✅ Limpeza deleted:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error deleting limpeza:', error);
    throw error;
  }
}

// MANUTENÇÕES Functions
async function addManutencao(manutencaoData) {
  try {
    const docRef = await addDoc(collection(window.db, 'manutencoes'), {
      ...manutencaoData,
      createdAt: Timestamp.now()
    });
    console.log('✅ Manutenção added:', docRef.id);
    await loadAllData();
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding manutenção:', error);
    throw error;
  }
}

async function deleteManutencao(id) {
  try {
    await deleteDoc(doc(window.db, 'manutencoes', id));
    console.log('✅ Manutenção deleted:', id);
    await loadAllData();
  } catch (error) {
    console.error('❌ Error deleting manutenção:', error);
    throw error;
  }
}

// Export functions for global use
window.loadAllData = loadAllData;
window.addReserva = addReserva;
window.updateReserva = updateReserva;
window.deleteReserva = deleteReserva;
window.addContato = addContato;
window.updateContato = updateContato;
window.deleteContato = deleteContato;
window.addLimpeza = addLimpeza;
window.deleteLimpeza = deleteLimpeza;
window.addManutencao = addManutencao;
window.deleteManutencao = deleteManutencao;

console.log('🔥 Firestore module loaded');

