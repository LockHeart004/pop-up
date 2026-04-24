// CONFIGURATION FIREBASE (À remplir après création du projet Firebase)
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    databaseURL: "VOTRE_DATABASE_URL",
    projectId: "VOTRE_PROJECT_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const HASH_GROUPE = "6071871239859f77f3a8f11812693892790938644e58a96435c2b04130f14652";
const CLE_CESAR = 8;
let monPseudo = "";
let affichageEnClair = true;
let tousLesMessages = [];

// 1. SÉCURITÉ D'ENTRÉE
async function verifierAcces() {
    const password = prompt("Code d'accès au serveur :");
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === HASH_GROUPE) {
        document.getElementById('app').style.display = 'block';
    } else {
        alert("ACCÈS RÉVOQUÉ.");
        window.location.reload();
    }
}

// 2. GESTION DU CHIFFREMENT
function crypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); }
function decrypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); }

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    document.getElementById('btn-toggle-view').innerText = affichageEnClair ? "🔒 Masquer" : "👁️ Voir";
    afficherMessages();
}

// 3. LOGIQUE DU CHAT
function definirPseudo() {
    monPseudo = document.getElementById('pseudo-input').value.trim();
    if(monPseudo) {
        document.getElementById('zone-pseudo').style.display = 'none';
        document.getElementById('zone-chat').style.display = 'block';
        ecouterMessages();
    }
}

function envoyerMessage() {
    const input = document.getElementById('msg-input');
    if(input.value.trim() === "") return;
    
    db.ref('messages/').push({
        u: monPseudo,
        m: crypter(input.value)
    });
    input.value = "";
}

function ecouterMessages() {
    db.ref('messages/').on('value', (snap) => {
        tousLesMessages = [];
        const data = snap.val();
        for(let id in data) tousLesMessages.push(data[id]);
        afficherMessages();
    });
}

function afficherMessages() {
    const box = document.getElementById('messages-display');
    box.innerHTML = "";
    tousLesMessages.forEach(msg => {
        let texteFinal = affichageEnClair ? decrypter(msg.m) : msg.m;
        
        if (affichageEnClair && texteFinal.includes(`@${monPseudo}`)) {
            document.getElementById('notif-mention').style.display = 'block';
        }

        box.innerHTML += `<div class="msg-item"><span class="msg-pseudo">${msg.u}:</span> ${texteFinal}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

// 4. FONCTIONS ADMIN
function accesAdmin() {
    if(prompt("Code Admin :") === "0000") { // Tu peux changer "0000"
        document.getElementById('btn-nettoyer').style.display = 'block';
    }
}

function nettoyerSalon() {
    if(confirm("Supprimer toute la mémoire ?")) db.ref('messages/').remove();
}

function lireMention() { document.getElementById('notif-mention').style.display = 'none'; }