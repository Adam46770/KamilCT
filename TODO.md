# TODO — Meeting Cost App

## 1. Struktura projektu

- [ ] Utwórz `index.html` z podstawowym szkieletem HTML5
- [ ] Utwórz `style.css` i podlinkuj w `index.html`
- [ ] Utwórz `app.js` i podlinkuj w `index.html` (przed `</body>`)

---

## 2. HTML — Szkielet widoków

- [ ] Widok **Main** — sekcja z kafelkami ról i przyciskiem Start
- [ ] Widok **Active Meeting** — sekcja z licznikiem kosztu, timerem i przyciskami
- [ ] Widok **Settings** — sekcja z formularzem edycji ról i wyborem waluty
- [ ] Domyślnie widoczny tylko widok Main (pozostałe ukryte przez CSS)

---

## 3. CSS — Stylowanie mobilne

- [ ] Reset CSS (`box-sizing`, marginesy, paddingi)
- [ ] Układ jednocolumnowy (`max-width`, `margin: auto`)
- [ ] Kafelki ról: przyciski `+` / `-` i licznik — min. 44 × 44 px touch target
- [ ] Minimalny rozmiar czcionki 16 px wszędzie
- [ ] Przycisk Start przyklejony do dołu ekranu (`position: sticky; bottom: 0`)
- [ ] Duży wyświetlacz kosztu na widoku Active Meeting
- [ ] Wysoki kontrast tekstu i tła
- [ ] Brak stylów zależnych wyłącznie od `:hover`

---

## 4. JavaScript — Dane i localStorage

- [ ] Zdefiniuj domyślną tablicę ról:
  ```js
  [
    { name: "Manager", rate: 120, count: 0 },
    { name: "Senior",  rate: 100, count: 0 },
    { name: "Mid",     rate: 70,  count: 0 },
    { name: "Junior",  rate: 50,  count: 0 }
  ]
  ```
- [ ] Funkcja `loadRoles()` — odczyt z `meetingCost:roles` (try/catch, fallback do domyślnych)
- [ ] Funkcja `saveRoles()` — zapis do `meetingCost:roles`
- [ ] Funkcja `loadSettings()` — odczyt z `meetingCost:settings` (try/catch, fallback do `{ currency: 'PLN' }`)
- [ ] Funkcja `saveSettings()` — zapis do `meetingCost:settings`

---

## 5. JavaScript — Wartości pochodne

- [ ] `getTotalParticipants()` — `sum(count)` po wszystkich rolach
- [ ] `getTotalHourlyRate()` — `sum(rate × count)` po wszystkich rolach
- [ ] Obie funkcje działają wyłącznie na bieżącej tablicy ról, nie przechowują wyniku

---

## 6. JavaScript — Widok Main (wybór składu)

- [ ] Renderuj kafelki ról na podstawie tablicy ról
- [ ] Przycisk `-` zmniejsza count (minimum 0), przycisk `+` zwiększa count
- [ ] Po każdej zmianie count: zapisz do localStorage, odśwież wyświetlany `totalHourlyRate`
- [ ] Przycisk Start zablokowany (`disabled`), gdy wszystkie counts = 0
- [ ] Kliknięcie Start — przejście do widoku Active Meeting

---

## 7. JavaScript — Timer (stan i logika)

- [ ] Zdefiniuj obiekt stanu timera:
  ```js
  { startTime: null, pausedAt: null, totalPausedMs: 0, isRunning: false }
  ```
- [ ] Funkcja `startTimer()` — ustaw `startTime = Date.now()`, `isRunning = true`
- [ ] Funkcja `pauseTimer()` — ustaw `pausedAt = Date.now()`, `isRunning = false`
- [ ] Funkcja `resumeTimer()` — dodaj `Date.now() - pausedAt` do `totalPausedMs`, wyczyść `pausedAt`, `isRunning = true`
- [ ] Funkcja `resetTimer()` — przywróć wszystkie pola do wartości domyślnych
- [ ] Funkcja `getElapsedMs()` — zwraca `Date.now() - startTime - totalPausedMs`

---

## 8. JavaScript — Kalkulacja kosztu

- [ ] Funkcja `getMeetingCost()`:
  ```js
  totalHourlyRate * (getElapsedMs() / 3_600_000)
  ```
- [ ] Wywoływana wyłącznie w pętli renderującej, nigdy w logice timera

---

## 9. JavaScript — Pętla renderująca

- [ ] Uruchom `setInterval(render, 250)` po kliknięciu Start
- [ ] Funkcja `render()` aktualizuje:
  - wyświetlany koszt (sformatowany przez `Intl.NumberFormat`)
  - czas trwania (format `MM:SS` lub `HH:MM:SS`)
  - liczbę uczestników
  - stawkę godzinową
- [ ] Zatrzymaj interval po kliknięciu Reset

---

## 10. JavaScript — Formatowanie

- [ ] Funkcja `formatCurrency(amount)` — używa `Intl.NumberFormat` z wybraną walutą
- [ ] Funkcja `formatTime(ms)` — zwraca `MM:SS` lub `HH:MM:SS` dla ≥ 60 minut
- [ ] Obie funkcje wywoływane wyłącznie w warstwie renderującej

---

## 11. JavaScript — Widok Active Meeting

- [ ] Po kliknięciu Start: ukryj Main, pokaż Active Meeting, uruchom timer i pętlę
- [ ] Przycisk **Pause** — wywołaj `pauseTimer()`, zamień na przycisk **Resume**
- [ ] Przycisk **Resume** — wywołaj `resumeTimer()`, zamień z powrotem na **Pause**
- [ ] Przycisk **Reset** — wywołaj `resetTimer()`, zatrzymaj interval, pokaż Main

---

## 12. JavaScript — Widok Settings (opcjonalny)

- [ ] Przycisk/link otwierający widok Settings z widoku Main
- [ ] Formularz: pola do edycji nazwy i stawki dla każdej roli
- [ ] Wybór waluty: PLN / EUR / USD
- [ ] Zapisz zmiany do localStorage po zatwierdzeniu
- [ ] Przycisk Anuluj / Wstecz — powrót do widoku Main bez zapisu

---

## 13. Walidacja i edge case'y

- [ ] Count nie może spaść poniżej 0
- [ ] Rate w Settings musi być liczbą > 0
- [ ] Start niedostępny gdy brak uczestników
- [ ] Koszt wyświetla `0,00 PLN` przed uruchomieniem timera
- [ ] Odświeżenie strony w trakcie spotkania wraca do widoku Main (timer nie jest persystowany)

---

## 14. Testy manualne

- [ ] Inkrementacja i dekrementacja ról działa poprawnie
- [ ] Start jest zablokowany gdy wszyscy counts = 0
- [ ] Koszt rośnie co ~0,5 s po kliknięciu Start
- [ ] Pause zamraża koszt; Resume kontynuuje od właściwej wartości
- [ ] Reset wraca do widoku Main z zachowanymi counts
- [ ] Odświeżenie strony przywraca role i counts z localStorage
- [ ] Zmiana waluty aktualizuje wszystkie wyświetlane wartości
- [ ] UI działa poprawnie na ekranie 375 px (iPhone SE)
- [ ] Brak błędów w konsoli przeglądarki

---

## 15. Deployment

- [ ] Upewnij się, że `index.html` jest w głównym katalogu repozytorium
- [ ] Włącz GitHub Pages (Settings → Pages → branch: `main`, folder: `/root`)
- [ ] Zweryfikuj działanie pod adresem `https://adam46770.github.io/kamilct/`
