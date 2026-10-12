import { db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, arrayUnion, query, orderBy } from 'firebase/firestore';

const clientsRef = collection(db, 'clients');

// 1. Add a new client with an optional empty history array
export async function addClient(clientData) {
  try {
    const docRef = await addDoc(clientsRef, {
      ...clientData,
      history: [], // Array to store past electrical repairs/jobs
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding client: ', error);
    return { success: false, error: error.message };
  }
}

// 2. Fetch all clients
export async function getClients() {
  try {
    const q = query(clientsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const clients = [];
    querySnapshot.forEach((docSnap) => {
      clients.push({ id: docSnap.id, ...docSnap.data() });
    });
    return { success: true, data: clients };
  } catch (error) {
    console.error('Error fetching clients: ', error);
    return { success: false, error: error.message };
  }
}

// 3. Add a job record to a specific client's history
export async function addClientHistory(clientId, jobRecord) {
  try {
    const clientDocRef = doc(db, 'clients', clientId);
    await updateDoc(clientDocRef, {
      history: arrayUnion({
        id: Date.now().toString(),
        date: jobRecord.date || new Date().toISOString().split('T')[0],
        fixType: jobRecord.fixType,         // e.g., "Circuit Breaker Replacement"
        laborCost: parseFloat(jobRecord.laborCost) || 0,
        partsUsed: jobRecord.partsUsed,     // e.g., "2x Schneider 32A Breaker"
        totalPrice: parseFloat(jobRecord.totalPrice) || 0,
        remarks: jobRecord.remarks || '',
      })
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating history: ', error);
    return { success: false, error: error.message };
  }
}

// 4. Delete a client
export async function deleteClient(id) {
  try {
    await deleteDoc(doc(db, 'clients', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting client: ', error);
    return { success: false, error: error.message };
  }
}