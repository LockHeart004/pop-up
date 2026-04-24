// 1. CONFIGURATION FIREBASE
// Remplace les valeurs ci-dessous par celles de ton projet Firebase
const firebaseConfig = {
    apiKey: "TON_API_KEY",
    databaseURL: "TON_URL_DATABASE",
    projectId: "TON_PROJECT_ID"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. VARIABLES GLOBALES
const HASH_GROUPE = "6071871239859f77f3a8f11812693892790938644e58a96435c2b04130f14652"; // Hash de "pop-up-2026"
const CLE_CESAR = 8;
const PWD_ADMIN = "0000"; // Ton code pour effacer les messages

let monPseudo = "";
let affichageEnClair = true;
let tousLesMessages = [];

// 3. SÉCURITÉ D'ENTRÉE (SHA-256)
async function verifierAcces() {
    let password = prompt("Code d'accès au serveur (pop-up-2026) :");
    
    if (password === null) return window.location.reload();

    // Nettoyage des espaces accidentels
    password = password.trim();

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === HASH_GROUPE) {
        document.getElementById('app').style.display = 'block';
    } else {
        alert("ACCÈS RÉVOQUÉ. Vérifiez l'orthographe exacte.");
        window.location.reload();
    }
}

// 4. SYSTÈME DE CHIFFREMENT (CÉSAR)
function crypter(t) { 
    return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); 
}

function decrypter(t) { 
    return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); 
}

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    document.getElementById('btn-toggle-view').innerText = affichageEnClair ? "🔒 Masquer" : "👁️ Voir";
    afficherMessages();
}

// 5. GESTION DU CHAT
function definirPseudo() {
    const input = document.getElementById('pseudo-input');
    monPseudo = input.value.trim();
    if (monPseudo !== "") {
        document.getElementById('zone-pseudo').style.display = 'none';
        document.getElementById('zone-chat').style.display = 'block';
        ecouterMessages();
    } else {
        alert("Choisis un pseudo d'abord !");
    }
}

function envoyerMessage() {
    const input = document.getElementById('msg-input');
    const texte = input.value.trim();
    
    if (texte === "") return;
    
    // Envoi du message crypté vers Firebase
    db.ref('messages/').push({
        u: monPseudo,
        m: crypter(texte),
        t: Date.now()
    });
    
    input.value = "";
}

function ecouterMessages() {
    // Cette fonction surveille la base de données en temps réel
    db.ref('messages/').on('value', (snap) => {
        tousLesMessages = [];
        const data = snap.val();
        for (let id in data) {
            tousLesMessages.push(data[id]);
        }
        afficherMessages();
    });
}

function afficherMessages() {
    const box = document.getElementById('messages-display');
    box.innerHTML = "";
    
    tousLesMessages.forEach(msg => {
        // Dépend de si l'utilisateur a cliqué sur "Voir" ou "Masquer"
        let texteFinal = affichageEnClair ? decrypter(msg.m) : msg.m;
        
        // Gestion des notifications (@pseudo)
        if (affichageEnClair && texteFinal.includes(`@${monPseudo}`)) {
            document.getElementById('notif-mention').style.display = 'block';
        }

        box.innerHTML += `
            <div class="msg-item">
                <span class="msg-pseudo">${msg.u}:</span> 
                <span class="msg-text">${texteFinal}</span>
            </div>`;
    });
    
    // Scroll automatique vers le bas
    box.scrollTop = box.scrollHeight;
}

// 6. FONCTIONS ADMIN
function accesAdmin() {
    let code = prompt("Mot de passe administrateur :");
    if (code === PWD_ADMIN) {
        document.getElementById('btn-nettoyer').style.display = 'inline-block';
        alert("Mode Admin activé.");
    } else {
        alert("Code incorrect.");
    }
}

function nettoyerSalon() {
    if (confirm("Voulez-vous vraiment effacer TOUS les messages du serveur ?")) {
        db.ref('messages/').remove();
        alert("Mémoire vidée.");
    }
}

function lireMention() {
    document.getElementById('notif-mention').style.display = 'none';
}
