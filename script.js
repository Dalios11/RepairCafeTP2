document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.getElementById("calendar-container");
    const selectDate = document.getElementById("date-jeudi");
 
    // CONFIGURATION GOOGLE CALENDAR
    const calendarId = "c_74caa954de6bd9ecbd7cf5923a5aa86cf4e75887a1156559e987415d53783c0a@group.calendar.google.com";
    const apiKey = "AIzaSyAxyJxx1u568-zYrR0CI96WhC8B1ZAlXKc"; 

    // 1. SI ON EST SUR LA PAGE D'ACCUEIL (index.html)
    if (calendarContainer) {
        calendarContainer.innerHTML = `<p style="color: var(--midnight-violet); font-size: 15px;">Chargement des prochaines séances...</p>`;
        fetchSessionsFromCalendar();
    }
 
    // 2. SI ON EST SUR LA PAGE D'INSCRIPTION (inscription.html)
    if (selectDate) {
        fetchDatesForDropdown();
    }
 
    async function fetchSessionsFromCalendar() {
        const today = new Date();
        const inSixtyDays = new Date();
        inSixtyDays.setDate(today.getDate() + 60);
 
        // LIGNE CORRIGÉE : L'URL de l'API Google au lieu de la balise <form>
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${today.toISOString()}&timeMax=${inSixtyDays.toISOString()}&orderBy=startTime&singleEvents=true&key=${apiKey}`;
 
        try {
            const response = await fetch(url);
            const data = await response.json();
 
            if (data.items) {
                const jeudis = data.items.filter(event => {
                    const d = new Date(event.start.dateTime || event.start.date);
                    return d.getDay() === 4; 
                }).slice(0, 4);
 
                const sessions = jeudis.map(event => {
                    const d = new Date(event.start.dateTime || event.start.date);
                    const options = { weekday: 'long', day: 'numeric', month: 'long' };
                    let dateFormatee = d.toLocaleDateString('fr-FR', options);
                    dateFormatee = dateFormatee.charAt(0).toUpperCase() + dateFormatee.slice(1);
                    
                    return {
                        date: dateFormatee,
                        description: event.description || ""
                    };
                });
 
                afficherSessions(sessions);
            } else {
                calendarContainer.innerHTML = `<p style="color: var(--midnight-violet);">Aucune séance trouvée prochainement.</p>`;
            }
        } catch (error) {
            console.error("Erreur de récupération de l'agenda :", error);
            calendarContainer.innerHTML = `<p style="color: var(--brick-ember);">Erreur lors du chargement des séances.</p>`;
        }
    }
 
    async function fetchDatesForDropdown() {
        const today = new Date();
        const inSixtyDays = new Date();
        inSixtyDays.setDate(today.getDate() + 60);
 
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${today.toISOString()}&timeMax=${inSixtyDays.toISOString()}&orderBy=startTime&singleEvents=true&key=${apiKey}`;
 
        try {
            const response = await fetch(url);
            const data = await response.json();
 
            if (data.items) {
                selectDate.innerHTML = '<option value="">Sélectionnez une date...</option>';
 
                data.items.forEach(event => {
                    const eventDate = new Date(event.start.dateTime || event.start.date);
                    if (eventDate.getDay() === 4) { 
                        const options = { weekday: 'long', day: 'numeric', month: 'long' };
                        let dateFormatee = eventDate.toLocaleDateString('fr-FR', options);
                        dateFormatee = dateFormatee.charAt(0).toUpperCase() + dateFormatee.slice(1);
 
                        const opt = document.createElement("option");
                        opt.value = event.id; 
                        opt.textContent = dateFormatee;
                        selectDate.appendChild(opt);
                    }
                });
            }
        } catch (error) {
            console.error("Erreur lors du chargement du menu déroulant :", error);
        }
    }
 
    function afficherSessions(sessions) {
        calendarContainer.innerHTML = "";
 
        sessions.forEach(session => {
            const card = document.createElement("div");
            card.className = "calendar-card";
 
            const title = document.createElement("h3");
            title.textContent = session.date;
            card.appendChild(title);
 
            const list = document.createElement("ul");
 
            if (session.description && session.description.trim() !== "") {
                const lignes = session.description.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
                
                lignes.forEach(ligne => {
                    const li = document.createElement("li");
                    let texteAffiche = ligne;
                    
                    // GESTION DES COULEURS
                    if (ligne.toLowerCase().includes("[benevole]")) {
                        li.style.color = "orange"; // Orange pour les bénévoles
                        li.style.fontWeight = "bold";
                        texteAffiche = ligne.replace(/\[benevole\]/gi, "").trim();
                    } 
                    else if (ligne.toLowerCase().includes("[visiteur]")) {
                        li.style.color = "#007BFF"; // Bleu clair pour les visiteurs
                        texteAffiche = ligne.replace(/\[visiteur\]/gi, "").trim();
                    }

                    li.textContent = `• ${texteAffiche}`;
                    list.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.textContent = "• Personne n'est encore inscrit";
                li.style.fontStyle = "italic";
                li.style.color = "#aaa";
                list.appendChild(li);
            }
 
            card.appendChild(list);
            calendarContainer.appendChild(card);
        });
    }
});