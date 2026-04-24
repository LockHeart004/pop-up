// 1. CONFIGURATION FIREBASE
// Remplace par tes vraies clés Firebase
const firebaseConfig = {
    apiKey: "TON_API_KEY",
    databaseURL: "TON_URL_DATABASE",
    projectId: "TON_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. PARAMÈTRES DE L'APP
const PWD_ACCES = "pop-up-2026"; // Le code d'entrée
const PWD_ADMIN = "0000";        // Le code pour effacer les messages
const CLE_CESAR = 8;

let monPseudo = "";
let affichageEnClair = true;
let tousLesMessages = [];

// 3. SÉCURITÉ D'ENTRÉE (Simplifiée)
function verifierAcces() {
    let saisie = prompt("Entrez le code d'accès :");

    if (saisie === null) return; // Si clic sur annuler

    // .trim() enlève les espaces et .toLowerCase() ignore les majuscules
    if (saisie.trim().toLowerCase() === PWD_ACCES) {
        document.getElementById('app').style.display = 'block';
    } else {
        alert("ACCÈS RÉVOQUÉ. Code incorrect.");
        window.location.reload();
    }
}

// 4. SYSTÈME DE CHIFFREMENT
function crypter(t) { 
    return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + CLE_CESAR)).join(''); 
}

function decrypter(t) { 
    return t.split('').map(c => String.fromCharCode(c.charCodeAt(0) - CLE_CESAR)).join(''); 
}

function basculerAffichage() {
    affichageEnClair = !affichageEnClair;
    const btn = document.getElementById('btn-toggle-view');
    btn.innerText = affichageEnClair ? "🔒 Masquer" : "👁️ Voir";
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
        alert("Choisis un pseudo !");
    }
}

function envoyerMessage() {
    const input = document.getElementById('msg-input');
    const texte = input.value.trim();
    if (texte === "") return;
    
    db.ref('messages/').push({
        u: monPseudo,
        m: crypter(texte)
    });
    input.value = "";
}

function ecouterMessages() {
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
        let texteFinal = affichageEnClair ? decrypter(msg.m) : msg.m;
        
        // Alerte si @pseudo est trouvé
        if (affichageEnClair && texteFinal.includes(`@${monPseudo}`)) {
            document.getElementById('notif-mention').style.display = 'block';
        }

        box.innerHTML += `
            <div class="msg-item">
                <span class="msg-pseudo">${msg.u}:</span> 
                <span class="msg-text">${texteFinal}</span>
            </div>`;
    });
    box.scrollTop = box.scrollHeight;
}

// 6. FONCTIONS ADMIN
function accesAdmin() {
    if (prompt("Code Admin :") === PWD_ADMIN) {
        document.getElementById('btn-nettoyer').style.display = 'inline-block';
    }
}

function nettoyerSalon() {
    if (confirm("Vider toute la discussion ?")) {
        db.ref('messages/').remove();
    }
}

function lireMention() {
    document.getElementById('notif-mention').style.display = 'none';
}
