/*
==========================================================
GOOGLE SHEET URLs
==========================================================
*/

const csvUrl_Players =
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vToJtMrATeURFrmUsPEcjPS1jb3tlqQP5WsQ0KygzE1VuwRg5Z3vsMMbgiHQBzNHhZzYlNpza2iPjKL/pub?output=csv`;

const csvUrl_Games_season1 =
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQrbbLSevXn0VUn6LTXuIQxf3J3cHxCaIpTPMCU7l9RQ9IlMgULTEdwJv_xAdSgCrD4mM1MdRfYcNcy/pub?output=csv`;

const csvUrl_Games_season2 =
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vSj5qzVIfL8BxZ38_7W0jgqYgG2QfJNApGULaOdjwrQd0mVTQgMseQxwKdwhq-77TLLmiWhUSxtaMpZ/pub?output=csv`;

const csvUrl_PlayerSignUps = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSZrGqO9n6R2LE20xy35qb3OQWI-95SzPQBS4CDnUi_vgM0m8B47YnRs7vRpLPeZdG0aPeG7-7hc4a3/pub?output=csv`;
/*
==========================================================
GLOBAL PLAYER DATA
==========================================================
*/

let playerList = [];

const playerMap = {};


/*
==========================================================
PERSON CLASS
==========================================================
*/

class Person {

    constructor(
        name,
        number,
        games_season1 = [],
        games_season2 = [],
        sympathy_season1 = 0,
        sympathy_season2 = 0,
        awesome_season1 = 0,
        awesome_season2 = 0,
        brad_season1 = 0,
        brad_season2 = 0
    ) {

        this.name = name;
        this.number = number;

        this.games_season1 = games_season1;
        this.games_season2 = games_season2;

        this.sympathy_season1 = sympathy_season1;
        this.sympathy_season2 = sympathy_season2;

        this.awesome_season1 = awesome_season1;
        this.awesome_season2 = awesome_season2;

        this.brad_season1 = brad_season1;
        this.brad_season2 = brad_season2;


        /*
        Unique ID
        */

        this.id = name
            .replaceAll(" ", "")
            .toLowerCase();


        /*
        Scores
        */

        this.score_season1 = 0;
        this.score_season2 = 0;
        this.score_lifetime = 0;


        /*
        Rankings
        */

        this.currentRank_season1 = 0;
        this.currentRank_season2 = 0;
        this.currentRank_lifetime = 0;


        /*
        HTML links
        */

        this.link_season1 = null;
        this.link_season2 = null;
        this.link_lifetime = null;
    }


    /*
    ======================================================
    CALCULATE SCORES
    ======================================================
    */

    calculateScore() {

        let totalPoints_season1 = 0;
        let totalPoints_season2 = 0;


        /*
        ------------------------------------------
        Season 1 game points
        ------------------------------------------
        */

        this.games_season1.forEach(game => {

            totalPoints_season1 += points(
                this.name,
                game.person2,
                game.quantity,
                "season1"
            );

        });


        /*
        ------------------------------------------
        Season 2 game points
        ------------------------------------------
        */

        this.games_season2.forEach(game => {

            totalPoints_season2 += points(
                this.name,
                game.person2,
                game.quantity,
                "season2"
            );

        });


        /*
        ------------------------------------------
        Add bonus points
        ------------------------------------------
        */

        totalPoints_season1 +=
            this.sympathy_season1 +
            this.awesome_season1;

        totalPoints_season2 +=
            this.sympathy_season2 +
            this.awesome_season2 +
            this.brad_season2;


        /*
        ------------------------------------------
        Lifetime score
        ------------------------------------------
        */

        const lifetimeScore =
            totalPoints_season1 +
            totalPoints_season2;


        /*
        Return all three scores
        */

        return [
            totalPoints_season1,
            totalPoints_season2,
            lifetimeScore
        ];
    }
}


/*
==========================================================
GAME CLASS
==========================================================
*/

class Game {

    constructor(
        date,
        person1,
        person2,
        type,
        quantity
    ) {

        this.date = date;
        this.person1 = person1;
        this.person2 = person2;
        this.type = type;
        this.quantity = quantity;
    }
}


/*
==========================================================
SCORING
==========================================================
*/

function points(
    name,
    p2,
    quantity,
    season
) {

    let currentPoints = 0;


    /*
    ------------------------------------------
    One game
    ------------------------------------------
    */

    if (quantity === 1) {

        if (name === "Ira D" && season === "season1") {
            currentPoints = 3;
        } else {
            currentPoints = 4;
        }
    }


    /*
    ------------------------------------------
    Two games
    ------------------------------------------
    */

    else if (quantity === 2) {

        if (name === "Ira D" && season === "season1") {
            currentPoints = 6;
        } else {
            currentPoints = 7;
        }
    }


    /*
    ------------------------------------------
    Three or more games
    ------------------------------------------
    */

    else {

        if (name === "Ira D" && season === "season1") {

            currentPoints =
                6 +
                (2 * (quantity - 2));

        } else {

            currentPoints =
                7 +
                (2 * (quantity - 2));
        }
    }


    /*
    ------------------------------------------
    Bonus for playing with Ira D
    ------------------------------------------
    */

    if (p2 === "Ira D") {

        currentPoints += quantity;
    }

    return currentPoints;
}


/*
==========================================================
FETCH ALL SHEETS
==========================================================
*/

async function fetchAllSheetsData() {

    try {

        const [
            playersResponse,
            season1Response,
            season2Response,
            playerSignUpsResponse
        ] = await Promise.all([

            fetch(csvUrl_Players),
            fetch(csvUrl_Games_season1),
            fetch(csvUrl_Games_season2),
            fetch(csvUrl_PlayerSignUps)

        ]);


        /*
        Check responses
        */

        if (
            !playersResponse.ok ||
            !season1Response.ok ||
            !season2Response.ok ||
            !playerSignUpsResponse.ok
        ) {

            throw new Error(
                "Failed to fetch one or more sheets."
            );
        }


        /*
        Convert responses to text
        */

        const [
            csvText_players,
            csvText_season1,
            csvText_season2,
            csvText_playerSignUps
        ] = await Promise.all([

            playersResponse.text(),
            season1Response.text(),
            season2Response.text(),
            playerSignUpsResponse.text()

        ]);


        /*
        Process everything
        */

        getData(
            csvText_players,
            csvText_season1,
            csvText_season2,
            csvText_playerSignUps
        );


        console.log(
            "All data processing complete."
        );

    }

    catch (error) {

        console.error(
            "ERROR:",
            error
        );


        const container =
            document.getElementById(
                "data-container"
            );


        if (container) {

            container.innerText =
                "Error: " +
                error.message;
        }
    }
}


/*
==========================================================
PARSE PLAYER INFORMATION
==========================================================
*/


function parsePlayerInformation(csvText) {

    /*
    Remove BOM and normalize line endings
    */

    const cleanText =
        csvText
            .replace(/^\uFEFF/, "")
            .replace(/\r/g, "");


    const rows =
        cleanText
            .trim()
            .split("\n");


    const players = [];


    /*
    Skip header row
    */

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const columns =
            rows[i]
                .split(",")
                .map(value => value.trim());


        const firstName =
            columns[0];

        const lastName =
            columns[1];

        const number =
            columns[2];


        /*
        Skip empty rows
        */

        if (
            !firstName ||
            !lastName
        ) {

            console.warn(
                "Skipping invalid player row:",
                rows[i]
            );

            continue;
        }


        /*
        Create full name
        */

        const fullName =
            `${firstName} ${lastName}`;


        /*
        Create Person object
        */

        const player =
            new Person(
                fullName,
                number
            );


        players.push(player);
    }


    return players;
}


/*
==========================================================
LOAD PLAYERS
==========================================================
*/

function loadPlayers(csvText) {

    /*
    Parse player sheet
    */

    playerList =
        parsePlayerInformation(
            csvText
        );


    /*
    Clear existing player map
    */

    Object.keys(playerMap).forEach(
        key => delete playerMap[key]
    );


    /*
    Build player map
    */

    playerList.forEach(player => {

        playerMap[player.name] =
            player;
    });


    console.log(
        "Loaded players:",
        playerList
    );
}


/*
==========================================================
PARSE GAME CSV
==========================================================
*/

function parseCSV(csvText) {

    /*
    Clean CSV
    */

    const cleanText =
        csvText
            .replace(/^\uFEFF/, "")
            .replace(/\r/g, "");


    const rows =
        cleanText
            .trim()
            .split("\n");


    const games = [];


    /*
    Skip header row
    */

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const columns =
            rows[i]
                .split(",")
                .map(value => value.trim());


        const date =
            columns[0];

        const player1 =
            columns[1];

        const player2 =
            columns[2];

        const type =
            columns[3];

        const quantity =
            Number(columns[4]);


        /*
        Skip invalid rows
        */

        if (
            !player1 ||
            !player2 ||
            !type ||
            Number.isNaN(quantity)
        ) {

            console.warn(
                "Skipping invalid game row:",
                rows[i]
            );

            continue;
        }


        const game =
            new Game(
                date,
                player1,
                player2,
                type,
                quantity
            );


        games.push(game);
    }


    return games;
}


/*
==========================================================
PROCESS GAMES
==========================================================
*/

function processGames(
    games,
    season
) {

    games.forEach(game => {

        /*
        Find players
        */

        const p1 =
            playerMap[game.person1];

        const p2 =
            playerMap[game.person2];


        /*
        ------------------------------------------
        Make sure player 1 exists
        ------------------------------------------
        */

        if (!p1) {

            console.error(
                "Unknown player:",
                game.person1,
                game
            );

            return;
        }


        /*
        ------------------------------------------
        AWESOME
        ------------------------------------------
        */

        if (
            game.type === "awe"
        ) {

            p1[
                `awesome_${season}`
            ] += game.quantity;

            return;
        }


        /*
        ------------------------------------------
        SYMPATHY
        ------------------------------------------
        */

        if (
            game.type === "sym"
        ) {

            p1[
                `sympathy_${season}`
            ] += game.quantity;

            return;
        }

        /*
        ------------------------------------------
        BRAD POINTS
        ------------------------------------------
        */

        if (
            game.type === "brad"
        ) {

            p1[
                `brad_${season}`
            ] += game.quantity;

            return;
        }


        /*
        ------------------------------------------
        SINGLES / DOUBLES
        ------------------------------------------
        */

        if (
            game.type === "d" ||
            game.type === "s"
        ) {

            /*
            Add game to player 1
            */

            addOrMergeGame(
                {
                    type: game.type,
                    person2: game.person2,
                    quantity: game.quantity
                },
                p1,
                season
            );


            /*
            --------------------------------------
            DOUBLES
            --------------------------------------

            Player 2 also gets this doubles game.
            */

            if (
                game.type === "d" &&
                p2
            ) {

                addOrMergeGame(
                    {
                        type: game.type,
                        person2: game.person1,
                        quantity: game.quantity
                    },
                    p2,
                    season
                );
            }

            return;
        }


        /*
        ------------------------------------------
        INVALID TYPE
        ------------------------------------------
        */

        console.error(
            `Invalid game type: ${game.type}`,
            game
        );

    });
}


/*
==========================================================
ADD OR MERGE GAME
==========================================================
*/

function addOrMergeGame(
    game,
    player,
    season
) {

    const gamesProperty =
        `games_${season}`;


    const games =
        player[gamesProperty];


    /*
    Find existing game
    */

    const existingGame =
        games.find(
            existing =>
                existing.type === game.type &&
                existing.person2 === game.person2
        );


    /*
    Merge quantities
    */

    if (existingGame) {

        existingGame.quantity +=
            game.quantity;

    }


    /*
    Otherwise add new game
    */

    else {

        games.push({

            type: game.type,

            person2: game.person2,

            quantity: game.quantity

        });
    }
}


/*
==========================================================
MAIN DATA PROCESSING
==========================================================
*/

function getData(
    csvText_players,
    csvText_season1,
    csvText_season2,
    csvText_playerSignUps
) {

    /*
    ------------------------------------------
    1. LOAD PLAYERS FIRST
    ------------------------------------------
    */

    loadPlayers(
        csvText_players
    );


    /*
    ------------------------------------------
    2. PARSE GAME SHEETS
    ------------------------------------------
    */

    const gamesList_season1 =
        parseCSV(
            csvText_season1
        );

    const gamesList_season2 =
        parseCSV(
            csvText_season2
        );


    /*
    ------------------------------------------
    3. PROCESS SEASON 1
    ------------------------------------------
    */

    processGames(
        gamesList_season1,
        "season1"
    );


    /*
    ------------------------------------------
    4. PROCESS SEASON 2
    ------------------------------------------
    */

    processGames(
        gamesList_season2,
        "season2"
    );


    /*
    ------------------------------------------
    5. CALCULATE SCORES
    ------------------------------------------
    */

    playerList.forEach(player => {

        const [
            score_season1,
            score_season2,
            score_lifetime
        ] =
            player.calculateScore();


        player.score_season1 =
            score_season1;

        player.score_season2 =
            score_season2;

        player.score_lifetime =
            score_lifetime;


        /*
        Sort Season 1 games
        */

        player.games_season1.sort(
            (a, b) =>
                a.person2.localeCompare(
                    b.person2
                )
        );


        /*
        Sort Season 2 games
        */

        player.games_season2.sort(
            (a, b) =>
                a.person2.localeCompare(
                    b.person2
                )
        );
    });


    /*
    ------------------------------------------
    6. SEASON 1 RANKING
    ------------------------------------------
    */

    const ranking_season1 =
        [...playerList].sort(
            (a, b) =>
                b.score_season1 -
                a.score_season1
        );


    ranking_season1.forEach(
        (player, index) => {

            player.currentRank_season1 =
                index + 1;
        }
    );


    /*
    ------------------------------------------
    7. SEASON 2 RANKING
    ------------------------------------------
    */

    const ranking_season2 =
        [...playerList].sort(
            (a, b) =>
                b.score_season2 -
                a.score_season2
        );


    ranking_season2.forEach(
        (player, index) => {

            player.currentRank_season2 =
                index + 1;
        }
    );


    /*
    ------------------------------------------
    8. LIFETIME RANKING
    ------------------------------------------
    */

    const ranking_lifetime =
        [...playerList].sort(
            (a, b) =>
                b.score_lifetime -
                a.score_lifetime
        );


    ranking_lifetime.forEach(
        (player, index) => {

            player.currentRank_lifetime =
                index + 1;
        }
    );


    /*
    ------------------------------------------
    9. RENDER RANKINGS
    ------------------------------------------
    */

    renderRankings(
        ranking_season1,
        "season1"
    );


    renderRankings(
        ranking_season2,
        "season2"
    );


    renderRankings(
        ranking_lifetime,
        "lifetime"
    );

    renderPlayerList();
    renderSignUpList(csvText_playerSignUps);


    /*
    ------------------------------------------
    10. DEBUG DATA
    ------------------------------------------
    */

    renderDebugData(
        gamesList_season1,
        gamesList_season2
    );
}


/*
==========================================================
RENDER RANKINGS
==========================================================
*/

function renderRankings(
    ranking,
    season
) {

        const rankingElement =
            document.getElementById(
                `ranking_HTML_${season}`
            );


    /*
    Make sure HTML exists
    */

    if (!rankingElement) {

        console.error(
            `Ranking element not found: ranking_HTML_${season}`
        );

        return;
    }                                         


    /*
    Clear ranking
    */

    rankingElement.innerHTML = "";


    /*
    Create each ranking entry
    */

    ranking.forEach(
        (player, index) => {

            const li =
                document.createElement(
                    "li"
                );


            const link =
                document.createElement(
                    "a"
                );


            /*
            Link ID
            */

            link.id =
                `${player.id}_${season}`;


            link.href = "#";


            /*
            Score
            */

            const score =
                player[
                    `score_${season}`
                ];


            /*
            Display:
            */

            link.textContent =
                `${player.name} ` +
                `(${score} points)`;


            /*
            Save link
            */

            player[
                `link_${season}`
            ] = link;


            /*
            Add to DOM
            */

            li.appendChild(link);

            rankingElement.appendChild(li);


            /*
            Player click
            */

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    handlePlayerClick(
                        player,
                        season
                    );
                }
            );
        }
    );
}



/*
==========================================================
RENDER PLAYER LIST
==========================================================
*/

function renderPlayerList() {

    const rankingElement =
        document.getElementById("playerDetailsList");

    // Clear player list
    rankingElement.innerHTML = "";

    // Sort alphabetically
    const sortedPlayers = [...playerList].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Create each player entry
    sortedPlayers.forEach((player) => {

        const li = document.createElement("li");

        const playerName = player.name;

        // Add to DOM
        li.textContent = playerName;

        rankingElement.appendChild(li);
    });
}


/*
==========================================================
RENDER SIGN UP LIST
==========================================================
*/

function renderSignUpList(csvText) {

    const signUpElement =
        document.getElementById("nextWeekPlayers");

    const backupQueue =
        document.getElementById("backupQueue");

    // Make sure the HTML elements exist
    if (!signUpElement || !backupQueue) {
        console.error("Could not find signup list elements.");
        return;
    }

    // Clear existing lists
    signUpElement.innerHTML = "";
    backupQueue.innerHTML = "";

    // Clean CSV and split into rows
    const rows = csvText
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/);

    // Get the registered players from the player list
    const validPlayers = playerList.map(player => {
        const nameParts = player.name.trim().split(/\s+/);

        return {
            firstName: nameParts[0].toLowerCase(),
            lastInitial: nameParts[nameParts.length - 1][0].toLowerCase(),
            fullName: player.name
        };
    });

    // Store only valid signups
    const validSignUps = [];

    // Track players already added
    const seenNames = new Set();    

    // Skip the header row and examine every signup
    for (let i = 1; i < rows.length; i++) {

        const columns = rows[i]
            .split(",")
            .map(value => value.trim());

        // The signup name is in column 2 (index 1)
        const signUpName = columns[1] || "";

        // Skip blank rows and blank names
        if (!signUpName) {
            continue;
        }

        // Accept names such as "Eric P" or "Eric P."
        const nameParts = signUpName
            .replace(/\./g, "")
            .trim()
            .split(/\s+/);

        // Require a first name and one last initial
        if (
            nameParts.length !== 2 ||
            !nameParts[0] ||
            !/^[a-z]$/i.test(nameParts[1])
        ) {
            console.warn("Invalid signup name:", signUpName);
            continue;
        }

        const firstName = nameParts[0].toLowerCase();
        const lastInitial = nameParts[1].toLowerCase();

        // Verify that the signup matches a registered player
        const matchedPlayer = validPlayers.find(player =>
            player.firstName === firstName &&
            player.lastInitial === lastInitial
        );

        // Skip names that are not on the player list
        if (!matchedPlayer) {
            console.warn("Player not found:", signUpName);
            continue;
        }

        // Store the official player name, not the typed variation
        const officialName = matchedPlayer.fullName;
        const nameKey = officialName.trim().toLowerCase();

        // Skip this player if they have already signed up
        if (seenNames.has(nameKey)) {
            continue;
        }

        seenNames.add(nameKey);
        validSignUps.push(officialName);

    }

    // Display the first two valid signups as confirmed
    validSignUps.forEach((playerName, index) => {

        const li = document.createElement("li");
        li.textContent = playerName;

        if (index < 21) {
            signUpElement.appendChild(li);
        } else {
            backupQueue.appendChild(li);
        }
    });
}


/*
==========================================================
SELECTED PLAYER
==========================================================
*/

let selectedPlayerLink = null;


/*
==========================================================
PLAYER CLICK HANDLER
==========================================================
*/


function handlePlayerClick(player, season) {

    // Remove previous selection
    if (selectedPlayerLink) {
        selectedPlayerLink.classList.remove("playerSelected");
    }

    // Clear old opponent highlighting
    playerList.forEach(p => {
        const link = p[`link_${season}`];

        if (link) {
            link.classList.remove("p2Singles", "p2Doubles");
        }
    });

    // Select the clicked player
    const link = player[`link_${season}`];

    if (!link) {
        return;
    }

    link.classList.add("playerSelected");
    selectedPlayerLink = link;

    // Get the seasons to include
    const seasons = season === "lifetime"
        ? ["season1", "season2"]
        : [season];

    // Highlight a player as an opponent or doubles partner
    function highlightPlayer(otherPlayer, type) {
        if (!otherPlayer || otherPlayer.name === player.name) {
            return;
        }

        const otherLink = otherPlayer[`link_${season}`];

        if (!otherLink) {
            return;
        }

        if (type === "d") {
            otherLink.classList.add("p2Doubles");
        } else if (type === "s") {
            otherLink.classList.add("p2Singles");
        }
    }

    // Check the selected player's own recorded games
    seasons.forEach(gameSeason => {
        player[`games_${gameSeason}`].forEach(game => {
            const otherPlayer = playerMap[game.person2];

            highlightPlayer(otherPlayer, game.type);
        });
    });

    // Also check games recorded under other players.
    // This catches singles games where the selected player
    // was recorded as person2 in the original spreadsheet.
    playerList.forEach(otherPlayer => {
        if (otherPlayer.name === player.name) {
            return;
        }

        seasons.forEach(gameSeason => {
            otherPlayer[`games_${gameSeason}`].forEach(game => {
                if (game.person2 === player.name) {
                    highlightPlayer(otherPlayer, game.type);
                }
            });
        });
    });

    // Show the selected player's details
    showPlayerDetails(player, season);
}



/*
==========================================================
SHOW PLAYER DETAILS
==========================================================
*/

function showPlayerDetails(
    player,
    season
) {

    const details =
        document.getElementById(
            `playerDetails_${season}`
        );


    /*
    Make sure element exists
    */

    if (!details) {

        console.error(
            `Details element not found: playerDetails_${season}`
        );

        return;
    }


    details.style.display =
        "block";


    /*
    ------------------------------------------
    Determine games
    ------------------------------------------
    */

    let games = [];


    if (season === "lifetime") {

        games = [
            ...player.games_season1,
            ...player.games_season2
        ];

    } else {

        games =
            player[`games_${season}`];
    }


    /*
    ------------------------------------------
    Determine points
    ------------------------------------------
    */

    let gamePointsTotal = 0;


    games.forEach(game => {

        gamePointsTotal +=
            points(
                player.name,
                game.person2,
                game.quantity,
                season
            );
    });


    /*
    ------------------------------------------
    Determine bonus points
    ------------------------------------------
    */

    let sympathy = 0;
    let awesome = 0;
    let brad = 0;


    if (season === "season1") {

        sympathy =
            player.sympathy_season1;

        awesome =
            player.awesome_season1;

        brad = 
            player.brad_season1;
    

    }


    else if (season === "season2") {

        sympathy =
            player.sympathy_season2;

        awesome =
            player.awesome_season2;

        brad = 
            player.brad_season2;

    }


    else if (season === "lifetime") {

        sympathy =
            player.sympathy_season1 +
            player.sympathy_season2;

        awesome =
            player.awesome_season1 +
            player.awesome_season2;

        brad = 
            player.brad_season1 + player.brad_season2;
    }


    /*
    ------------------------------------------
    Score and rank
    ------------------------------------------
    */

    const score =
        player[`score_${season}`];


    const rank =
        player[`currentRank_${season}`];


    /*
    ------------------------------------------
    Create game HTML
    ------------------------------------------
    */

    const gamesHTML =
        games.map(game => {

            const gameText =

                game.type === "d"

                    ? `
                        Doubles with
                        <span class="playerNameDoubles">
                            ${game.person2}
                        </span>
                    `

                    : `
                        Singles against
                        <span class="playerNameSingles">
                            ${game.person2}
                        </span>
                    `;


            const gamePoints =
                points(
                    player.name,
                    game.person2,
                    game.quantity,
                    season
                );


            return `
                <li>

                    ${gameText}

                    (x${game.quantity})

                    — <em>
                        ${gamePoints} pts
                    </em>

                </li>
            `;

        }).join("");


    /*
    ------------------------------------------
    Season title
    ------------------------------------------
    */

    let seasonTitle = "";


    if (season === "season1") {

        seasonTitle = "Season 1";

    } else if (season === "season2") {

        seasonTitle = "Season 2";

    } else {

        seasonTitle = "Lifetime";
    }


    /*
    ------------------------------------------
    Render details
    ------------------------------------------
    */

    details.innerHTML = `

        <h2>
            ${player.number}
            ${player.name}
        </h2>


        <p>
            <strong>
                ${seasonTitle} Rank:
            </strong>

            ${rank}
        </p>


        <p>
            <strong>
                Points Earned From Games:
            </strong>

            ${gamePointsTotal}
        </p>


        <p>
            <strong>
                Sympathy Points:
            </strong>

            ${sympathy}
        </p>


        <p>
            <strong>
                Awesomeness Points:
            </strong>

            ${awesome}
        </p>

        <p>
            <strong>
                Points for Playing Against Brad:
            </strong>

            ${brad}
        </p>


        <p>
            <strong>
                Overall Total Points:
            </strong>

            ${score}
        </p>


        <p>
            <strong>
                Games:
            </strong>
        </p>


        <ul>
            ${gamesHTML}
        </ul>
    `;
}


/*
==========================================================
DEBUG DATA
==========================================================
*/

function renderDebugData(
    gamesList_season1,
    gamesList_season2
) {

    const dataContainer =
        document.getElementById(
            "data-container"
        );


    if (!dataContainer) {
        return;
    }


    let html = "";


    /*
    ------------------------------------------
    Players
    ------------------------------------------
    */

    html += `
        <h3>Players</h3>
    `;


    playerList.forEach(player => {

        html += `
            #${player.number}
            ${player.name}
            <br>
        `;
    });


    /*
    ------------------------------------------
    Season 1 games
    ------------------------------------------
    */

    html += `
        <h3>Season 1 Games</h3>
    `;


    gamesList_season1.forEach(game => {

        html += `
            ${game.person1}
            →
            ${game.person2}
            (${game.type}, x${game.quantity})
            <br>
        `;
    });


    /*
    ------------------------------------------
    Season 2 games
    ------------------------------------------
    */

    html += `
        <h3>Season 2 Games</h3>
    `;


    gamesList_season2.forEach(game => {

        html += `
            ${game.person1}
            →
            ${game.person2}
            (${game.type}, x${game.quantity})
            <br>
        `;
    });


    dataContainer.innerHTML =
        html;
}


/*
==========================================================
START APPLICATION
==========================================================
*/

fetchAllSheetsData();


/*
==========================================================
SEASON TABS
==========================================================
*/

const tabButtons =
    document.querySelectorAll(
        ".tab-btn"
    );


const tabPanels =
    document.querySelectorAll(
        ".tab-panel"
    );


tabButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            /*
            Remove active from buttons
            */

            tabButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );
            });


            /*
            Remove active from panels
            */

            tabPanels.forEach(panel => {

                panel.classList.remove(
                    "active"
                );
            });


            /*
            Activate clicked button
            */

            button.classList.add(
                "active"
            );


            /*
            Find target panel
            */

            const targetSelector =
                button.getAttribute(
                    "data-target"
                );


            const targetPanel =
                document.querySelector(
                    targetSelector
                );


            /*
            Activate target panel
            */

            if (targetPanel) {

                targetPanel.classList.add(
                    "active"
                );
            }
        }
    );
});


