import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

// loader function 
const loader = (element) => {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.'

        if (element.textContent === '....') element.textContent = ''
    }, 300)
}

// text function

const typeText = (element, text) => {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 30)
}

// generate unique id

const generateUniqueID = () => {
    const timestamp = Date.now()
    const randomNumber = Math.random()
    const hexaDecimalString = randomNumber.toString(16)

    return `id-${timestamp}-${hexaDecimalString}`
}

// chatstripe

const chatStripe = (isAi, value, uniqueID) => {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                        src="${isAi ? 'bot' : 'user'}"
                        alt="${isAi ? 'bot' : 'user'}"
                    />
                </div>

                <div class="message" id=${uniqueID}>
                    ${value}
                </div>

            </div>
        </div>

        `
    )
}

// handle submit 

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user stripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    form.reset()

    // bot chat stripe
    const uniqueID = generateUniqueID()

    chatContainer.innerHTML += chatStripe(true, " ", uniqueID)

    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueID)

    loader(messageDiv)

    // fetch data from the server -> bot's response

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if (response.ok) {
        const data = await response.json()
        const parsedData = data.bot.trim()

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = 'Something went wrong :('

        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    };
})