let currentSong = new Audio()
let circle = document.querySelector(".circle")
let songs;
let currFolder;

function formatToMinutesSeconds(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Ensure both minutes and seconds are always two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //to display the songs
    let songUL = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="songinfo">
                                <div class="name">${song.replaceAll("%20", " ")}</div>
                                <div class="artist">Rahul</div>
                            </div>
                            <div class="playing">
                                <p>Play Now</p>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`
    }
    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    })
    
    return songs


}
getSongs()

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinf").innerHTML = decodeURI(track)
    document.querySelector(".time").innerHTML = "00:00/00.00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    console.log(response)
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folders = e.href.split("/").slice(-2)[0]
            console.log(folders)
            let a = await fetch(`http://127.0.0.1:3000/songs/${folders}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folders}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                <!-- Green circular background -->
                                <circle cx="24" cy="24" r="24" fill="#4CAF50" />

                                <!-- Solid black play icon (triangle) centered -->
                                <polygon points="20,16 32,24 20,32" fill="#000000" />
                            </svg>

                        </div>
                        <img src="/songs/${folders}/cover.jpeg" alt="">
                        <h5>${response.title}</h5>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //add event listener to the card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}


async function main() {
    //To get the songs
    await getSongs("songs/best")
    playMusic(songs[0], true)


    // to display albums
    displayAlbums()

    // to play,previous and next
    let play = document.querySelector("#play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //update time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${formatToMinutesSeconds(Math.floor(currentSong.currentTime))}/${formatToMinutesSeconds(Math.floor(currentSong.duration))}`
        //to update the seekbar
        let circle = document.querySelector(".circle")
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add event listener to a seekbar
    let seekbar = document.querySelector(".seekbar")
    seekbar.addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Add a event listener to previous
    let previous = document.querySelector("#previous")
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    //Add a event listener to next
    let next = document.querySelector("#next")
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    let volume = document.querySelector(".volume input")
    let mute = document.querySelector("#mute")
    let medium = document.querySelector("#medium")
    let high = document.querySelector("#high")

    //to mute on click
    let mu = document.querySelectorAll(".volume img")
    let arr = Array.from(mu)
    for (let index = 0; index < arr.length; index++) {
        const el = arr[index];
        el.addEventListener("click", (e) => {
            currentSong.volume = 0
            //e.target.src="mute.svg"
            medium.style.display = "none"
            high.style.display = "none"
            mute.style.display = "block"
            volume.value = 0

        })
    }

    // add an event listener to change the volume
    volume.addEventListener("change", (e) => {
        console.log("Setting volune to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        let mute = document.querySelector("#mute")
        let medium = document.querySelector("#medium")
        let high = document.querySelector("#high")
        if (e.target.value <= 100 && e.target.value > 50) {
            mute.style.display = "none"
            medium.style.display = "none"
            high.style.display = "block"
        }
        else if (e.target.value <= 50 && e.target.value > 0) {
            mute.style.display = "none"
            medium.style.display = "block"
            high.style.display = "none"
        }
        else if (e.target.value == 0) {
            mute.style.display = "block"
            medium.style.display = "none"
            high.style.display = "none"
        }
    })


}

main()

function hamburger() {
    let menu = document.querySelector(".left img")
    let left = document.querySelector(".left2")
    menu.addEventListener("click", () => {
        left.style.left = 0
    })
    let cancel = document.querySelector(".top img")
    cancel.addEventListener("click", () => {
        left.style.left = "-100%"
    })
}
hamburger()