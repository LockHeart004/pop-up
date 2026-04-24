// ==========================================
// 1. VARIABLES ET CONFIGURATION (D'ABORD !)
// ==========================================
const PWD_ACCES = "pop-up-2026"; 
const PWD_ADMIN = "0000";        
const CLE_CESAR = 8;

// REMPLACE BIEN CES 3 LIGNES :
const firebaseConfig = {
    apiKey: "AIzaSyDJoijuxHAUuRGKbaFvIRTRCuW4HAhTV1U", 
    databaseURL: "https://heart-project-community-default-rtdb.firebaseio.com", // DOIT COMMENCER PAR HTTPS
    projectId: "heart-project-community"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let monPseudo = "";
let affichageEnClair = true;
let tousLesMessages = [];

// ==========================================
// 2. FONCTION DE VÉRIFICATION (APPELÉE AU CHARGEMENT)
// ==========================================
function verifierAcces() {
    let saisie = prompt("Entrez le code d'accès :");
    if (saisie === null) return;

    if (saisie.trim().toLowerCase() === PWD_ACCES) {
        document.getElementById('app').style.display = 'block';
    } else {
        alert("ACCÈS RÉVOQUÉ.");
        window.location.reload();
    }
}

// ==========================================
// 3. LE RESTE DES FONCTIONS
// ==========================================
function crypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); }
function decrypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); }

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    document.getElementById('btn-toggle-view').innerText = affichageEnClair ? "🔒 Masquer" : "👁️ Voir";
    afficherMessages();
}

function definirPseudo() {
    monPseudo = document.getElementById('pseudo-input').value.trim();
    if (monPseudo) {
        document.getElementById('zone-pseudo').style.display = 'none';
        document.getElementById('zone-chat').style.display = 'block';
        ecouterMessages();
    }
}

function envoyerMessage() {
    const input = document.getElementById('msg-input');
    if (input.value.trim() === "") return;
    db.ref('messages/').push({ u: monPseudo, m: crypter(input.value) });
    input.value = "";
}

function ecouterMessages() {
    db.ref('messages/').on('value', (snap) => {
        tousLesMessages = [];
        const data = snap.val();
        for (let id in data) { tousLesMessages.push(data[id]); }
        afficherMessages();
    });
}

function afficherMessages() {
    const box = document.getElementById('messages-display');
    box.innerHTML = "";
    tousLesMessages.forEach(msg => {
        let texteFinal = affichageEnClair ? decrypter(msg.m) : msg.m;
        box.innerHTML += `<div class="msg-item"><span class="msg-pseudo">${msg.u}:</span> ${texteFinal}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

function accesAdmin() { if (prompt("Code Admin :") === PWD_ADMIN) document.getElementById('btn-nettoyer').style.display = 'inline-block'; }
function nettoyerSalon() { if (confirm("Vider ?")) db.ref('messages/').remove(); }
