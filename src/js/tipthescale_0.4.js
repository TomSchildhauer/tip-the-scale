//======================
// CONSTANTS
//======================

const minDifficulty = 4000;
const maxDifficulty = 50000;

//======================
// VARIABLES
//======================

let playfieldWidth, playfieldVariety, activeRatio;
let mapState = [0][0];
let editMode = false;


//======================
// GENERAL EVENT BINDINGS
//======================

window.onpopstate = loadFromURL;


//======================
// INITIAL INSTRUCTIONS
//======================

startUp();


//======================
// FUNCTIONS
//======================

function startUp () {
    if (!loadFromURL() && !loadFromSaveGame()) {
        setUpField(3, 2, 0.3);
    }
    
    updateURLandLocalStorage();
}

function loadFromURL () {
    const urlGameState = window.location.search;
    const fieldAsString = urlGameState.split("l=", 2)[1];

    if (fieldAsString != "" && fieldAsString != undefined) {
        loadField(fieldAsString);    
        return true;
    }
    return false;
}

function loadFromSaveGame () {
    const savedGameState = localStorage.getItem("Saved Game");

    if (savedGameState != null) {
        loadField(savedGameState);    
        return true;
    }
    return false;
}

function loadField (fieldAsString) {
    const allTheInfo = fieldAsString.split("|");
    const allTheFields = allTheInfo[3].split(",");

    setUpField(allTheInfo[0], allTheInfo[1], allTheInfo[2], false, allTheFields);
}

function fieldToString () {
    const fieldString = `${playfieldWidth}|${playfieldVariety}|${activeRatio}|${mapState.toString()}`;

    return fieldString;
}

function startEasierGame () {
    tweakSettings(-240);
    startCustomGame();
}

function startHarderGame () {
    tweakSettings(+160);
    startCustomGame();
}

function tweakSettings (tweakage) {
    const currentDifficulty = calculateDifficulty(width_input.value, variety_input.value, fillRatio_input.value);
    const newDifficulty = Math.floor(Math.max(minDifficulty, Math.min(maxDifficulty, currentDifficulty + tweakage)));

    let newWidth, newVariety, newRatio;
    let tempI = 0;
    do {
        tempI++;
        newWidth = Math.floor(Math.random() * 10) + 3;
        newVariety = Math.floor(Math.random() * 3) + 2;
        newRatio = newDifficulty / calculateDifficulty(newWidth, newVariety, 1);
    } while ((newRatio < 35 || newRatio > 100) && tempI < 1000);

    //round to the next not-so-crazy-number
    newRatio = Math.floor(newRatio * 100) / 100;
    
    width_input.value = newWidth;
    variety_input.value = newVariety;
    fillRatio_input.value = newRatio;

    console.log("Tweaking difficulty: current = " + currentDifficulty + " | going for " + newDifficulty + " (created in " + tempI + " tries) | real new = " + calculateDifficulty(newWidth, newVariety, newRatio));
}

function calculateDifficulty (fieldWidth, colorVariety, fillRatio) {
    return Math.pow(fieldWidth, 2) * Math.pow(colorVariety, 3) * fillRatio;
}

function startCustomGame () {
    setUpField(width_input.value, variety_input.value, fillRatio_input.value/100, (!editMode));
}

function setUpField (width = 8, variety = 2, fillAmount = 0.5, fillRandomly = true, loadedMap = "") {
    //Remember the values for later
    playfieldWidth = Math.max(2, Number(width));
    playfieldVariety = Math.max(2, Number(variety));
    activeRatio = Math.max(0.1, Number(fillAmount));

    width_input.value = playfieldWidth;
    variety_input.value = playfieldVariety;
    fillRatio_input.value = activeRatio * 100;

    //Inform the CSS
    document.documentElement.style.setProperty("--playfieldWidth", playfieldWidth);

    //Make sure to remember whether there was even an active field during the creation!
    let activeOnes;
    do {
        activeOnes = 0;

        //Clear field
        playfield_div.innerHTML = "";
        mapState = [playfieldWidth];

    
        //Rebuild the field
        for (let y = 0; y < playfieldWidth; y++) {
            for (let x = 0; x < playfieldWidth; x++) {

                //Clone the template button (defined by its ID)
                let duplicate = buttonTemplate_button.cloneNode();
                duplicate.id = "btn" + (x + (y * playfieldWidth));
                
                duplicate.onclick = function () { hitButton(x, y); }
                
                playfield_div.appendChild(duplicate);

                //Do Array-Things
                if (y === 0)
                    mapState[x] = [playfieldWidth];
                    
                //If this is not loading but generating a new map
                if (loadedMap === "") {
                    if (Math.random() > activeRatio)
                        mapState[x][y] = -1;
                    else {
                        mapState[x][y] = 0;
                        activeOnes++;
                    }
                } else {
                    mapState[x][y] = Number(loadedMap[(y + (x * playfieldWidth))]);
                }

                //Hide inactive buttons
                applyVisibility(x, y);
            }    
        }
        if (activeOnes < 3 && loadedMap === "") console.log("Created empty field. Trying again.");
    } while (activeOnes < 3 && loadedMap === ""); //Retry if random field came out empty
    
    //Fill the map with values
    if (fillRandomly) {
        scramble();
    }
    
    updateField();
}

function applyVisibility (x, y) {
    const btn = document.getElementById("btn" + (x + (y * playfieldWidth)));

    if (editMode || mapState[x][y] != -1)
        btn.style.visibility = "visible";
    else
        btn.style.visibility = "hidden";
}

function scramble (resetBefore = false) {
    if (resetBefore) {
        for (let y = 0; y < playfieldWidth; y++) {
            for (let x = 0; x < playfieldWidth; x++) {
                if (mapState[x][y] != -1)
                mapState[x][y] = 0;
            }
        }
    }
    
    let solved = false;
    do {
        for (let y = 0; y < playfieldWidth; y++) {
            for (let x = 0; x < playfieldWidth; x++) {
                if (mapState[x][y] != -1) {
                    hitButton(x, y, Math.round(Math.random() * (playfieldVariety - 1)), true, true);
                }
            }
        }
        solved = checkIfSolved();
        if (solved) console.log("Field already solved. Trying again to scramble.");
    } while (solved);

    updateField();
    updateURLandLocalStorage();
}

function hitButton (x, y, times = 1, doNotUpdate = false, ignoreEditMode = false) {
    
    if (editMode && !ignoreEditMode) {
        flipState(x, y, false, false);
    
    } else if (mapState[x][y] != -1) {
        for (let i = 0; i < times; i++) {
            flipState(x, y, doNotUpdate);

            if (x-1 >= 0)
                flipState(x-1, y, doNotUpdate);

            if (x+1 < playfieldWidth)
                flipState(x+1, y, doNotUpdate);

            if (y-1 >= 0)
                flipState(x, y-1, doNotUpdate);

            if (y+1 < playfieldWidth)
                flipState(x, y+1, doNotUpdate);    
        }
    }

    setSolved(checkIfSolved());
    updateURLandLocalStorage();

    setSettingVisibility(false);
}

function flipState(x, y, doNotUpdate = false, minusOneMeansEmpty = true) {
    
    if (!minusOneMeansEmpty) {
        mapState[x][y] = mapState[x][y] + 1;
        if (mapState[x][y] === playfieldVariety)
            mapState[x][y] = -1;

    } else if (mapState[x][y] != -1) {
        mapState[x][y] = (mapState[x][y] + 1) % playfieldVariety;
    }

    if (!doNotUpdate)
        updateButton(x, y);
}

function updateField () {
    for (let y = 0; y < playfieldWidth; y++) {
        for (let x = 0; x < playfieldWidth; x++) {
            updateButton(x, y);
        }
    }
}

function updateButton (x, y) {
    let thatButton = playfield_div.childNodes[(x + (y * playfieldWidth))];

    thatButton.innerHTML = mapState[x][y];
    thatButton.className = "";
    thatButton.classList.add("playfield_buttons");
    thatButton.classList.add("button-content_" + mapState[x][y]);
}

function updateURLandLocalStorage () {
    const fieldString = fieldToString();
    window.history.pushState("", "", "?l=" + fieldString);
    share_input.value = window.location;
    localStorage.setItem("Saved Game", fieldString);
}

function checkIfSolved () {
    let onlyState = -1;
    for (let y = 0; y < playfieldWidth; y++) {
        for (let x = 0; x < playfieldWidth; x++) {
            const state = mapState[x][y];
            if (onlyState === -1)
                onlyState = state;
            else if ((state != -1) && (state != onlyState)) {
                return false;
            }
        }
    }
    return true;
}

function setSolved (isSolved) {
    harderGame_button.disabled = !isSolved;
}

function toggleEditMode () {
    //Flick the switch
    editMode = !editMode;

    //Turn buttons of inactive fields visible or invisible
    for (let y = 0; y < playfieldWidth; y++) {
        for (let x = 0; x < playfieldWidth; x++) {
            applyVisibility(x, y);
        }
    }

    //Toggle Button Text & Style + Scramble Button
    if (editMode) {
        edit_play_button.innerHTML = "Play";
        edit_play_button.classList.add("inEditMode");
        scramble_button.classList.add("inEditMode");
        updateURLandLocalStorage();

        setSettingVisibility(false);
    } else {
        edit_play_button.innerHTML = "Edit";
        edit_play_button.classList.remove("inEditMode");
        scramble_button.classList.remove("inEditMode");
    }
}

function toggleSettingVisibility () {
    setSettingVisibility (innerSettings_div.classList.contains("hidden"));
}

function setSettingVisibility (state = true) {
    const isHidden = innerSettings_div.classList.contains("hidden");

    if (state && isHidden) {
        toggleSettings_button.classList.add("inset");
        innerSettings_div.classList.remove("hidden");
        easierGame_button.style.display = "none";
        harderGame_button.style.display = "none";
        customGame_button.style.display = "initial";
    } else if (!state && !isHidden) {
        toggleSettings_button.classList.remove("inset");
        innerSettings_div.classList.add("hidden");
        easierGame_button.style.display = "initial";
        harderGame_button.style.display = "initial";
        customGame_button.style.display = "none";
    }
}