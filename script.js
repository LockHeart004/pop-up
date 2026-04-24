// --- CONFIGURATION ---
const PWD_ACCES = "pop-up-2026";
const PWD_ADMIN = "0000";
const CLE_CESAR = 8;

const firebaseConfig = {
    apiKey: "TON_API_KEY",
    databaseURL: "https://TON_PROJET.firebaseio.com",
    projectId: "TON_PROJET_ID"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let monPseudo = "";
let affichageEnClair = true;
let tousLesMessages = [];

// --- LOGIQUE D'ACCÈS ---
function verifierAcces() {
    let saisie = prompt("Code d'accès :");
    if (saisie === null) return;
    if (saisie.trim().toLowerCase() === PWD_ACCES) {
        // L'app reste en class "hidden" au début, on l'active juste en mémoire
        console.log("Accès autorisé. Cliquez sur la bulle.");
    } else {
        alert("ACCÈS RÉVOQUÉ.");
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

// --- CHIFFREMENT ---
function crypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); }
function decrypter(t) { return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); }

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    document.getElementById('btn-toggle-view').innerText = affichageEnClair ? "🔒 Masquer" : "👁️ Voir";
    afficherMessages();
}

// --- CORE CHAT ---
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
        
        // Notif si mentionné et que le chat est fermé
        if (texteFinal.includes(`@${monPseudo}`)) {
            if (document.getElementById('app').classList.contains('hidden')) {
                document.getElementById('notif-dot').style.display = 'block';
            } else {
                document.getElementById('notif-mention').style.display = 'block';
            }
        }
        box.innerHTML += `<div class="msg-item"><span class="msg-pseudo">${msg.u}:</span> ${texteFinal}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

function accesAdmin() { if (prompt("Admin :") === PWD_ADMIN) document.getElementById('btn-nettoyer').style.display = 'block'; }
function nettoyerSalon() { if (confirm("Vider ?")) db.ref('messages/').remove(); }
function lireMention() { document.getElementById('notif-mention').style.display = 'none'; }
