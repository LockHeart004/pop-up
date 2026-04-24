// --- CONFIGURATION ---
const PWD_ACCES = "pop-up-2026";
const PWD_ADMIN = "21072003"; 
const CLE_CESAR = 8;

const firebaseConfig = {
    apiKey: "AIzaSyDJoijuxHAUuRGKbaFvIRTRCuW4HAhTV1U",
    databaseURL: "https://heart-project-community-default-rtdb.firebaseio.com",
    projectId: "heart-project-community"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let monPseudo = "";
let isAdmin = false;
let affichageEnClair = true;
let tousLesMessages = [];

// --- RACCOURCI CLAVIER : Alt + H ---
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        const screen = document.getElementById('hide-screen');
        screen.style.display = (screen.style.display === 'block') ? 'none' : 'block';
    }
});

// --- ACCÈS & BULLE ---
function verifierAcces() {
    let s = prompt("Code :");
    if (s && s.trim().toLowerCase() === PWD_ACCES) {
        console.log("Connecté.");
    } else {
        window.location.reload();
    }
}

function toggleChat() {
    const app = document.getElementById("app");
    app.classList.toggle("hidden");
    if (!app.classList.contains("hidden")) {
        app.style.display = "flex";
        document.getElementById('notif-dot').style.display = 'none';
    }
}

// --- LOGIQUE ADMIN ---
function accesAdmin() {
    if (prompt("ADMIN CODE :") === PWD_ADMIN) {
        isAdmin = true;
        document.getElementById('admin-panel').style.display = 'block';
        alert("Mode Admin Activé.");
        afficherMessages();
    }
}

function supprimerMsg(id) {
    if (isAdmin && confirm("Supprimer ?")) db.ref('messages/' + id).remove();
}

function modifierMsg(id, texteCode) {
    if (!isAdmin) return;
    let n = prompt("Modifier :", decrypter(texteCode));
    if (n) db.ref('messages/' + id).update({ m: crypter(n) });
}

function changerTheme(c) {
    const app = document.getElementById('app');
    app.style.borderColor = c;
    app.style.boxShadow = `0 0 20px ${c}`;
}

// --- FONCTIONS CHAT ---
function crypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); }
function decrypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); }

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
        const data = snap.val();
        tousLesMessages = [];
        for (let id in data) { tousLesMessages.push({id, ...data[id]}); }
        afficherMessages();
    });
}

function afficherMessages() {
    const box = document.getElementById('messages-display');
    box.innerHTML = "";
    tousLesMessages.forEach(msg => {
        let texte = affichageEnClair ? decrypter(msg.m) : msg.m;
        let tools = isAdmin ? `<span class="admin-action" onclick="supprimerMsg('${msg.id}')">❌</span><span class="admin-action" onclick="modifierMsg('${msg.id}','${msg.m}')">✏️</span>` : "";
        
        box.innerHTML += `<div class="msg-item"><span class="msg-pseudo">${msg.u}:</span>${texte}${tools}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    document.getElementById('btn-toggle-view').innerText = affichageEnClair ? "🔒" : "👁️";
    afficherMessages();
}

function nettoyerSalon() { if (isAdmin && confirm("Vider tout ?")) db.ref('messages/').remove(); }
function lireMention() { document.getElementById('notif-mention').style.display = 'none'; }
