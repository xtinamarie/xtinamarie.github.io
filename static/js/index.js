let formElement = document.getElementById("form");
let inputField = document.querySelector(".input-field");
let outputBox = document.querySelector(".output");
let outputList = document.querySelector(".output-list");
let outputItem = document.querySelector(".output-item");
let terminalContainer = document.querySelector(".terminal-container");

// Input field is automatically in focus
inputField.focus();

// If terminal div is clicked, focus on inputField.
terminalContainer.addEventListener("click", ()=>{
    inputField.focus();
})

// HISTORY
let historyList = [];
let historyPosition = 0;
let historyTemp = 0;

function createListItem() {
    let results = document.createElement('div');
    results.classList.add("cmd-results");

    switch (inputField.value.toLowerCase()) {
        case "faq":
            addPreviousCmd();

            results.innerHTML = `
            <div class="faq">
                <br>
                    Here are some of my most recently asked questions about my page:<br><br>
                    <strong>Why did I create a terminal style portfolio?</strong><br>
                    <font size="-1">I chose to create a terminal style portfolio because, as a developer and aspiring penetration tester, the terminal is
                    something that I and many other developers use in our day-to-day job functions. I created this style portfolio with
                    the intention of allowing my non-tech savvy audience to get a simple feel of what it is like to use one of our daily
                    tools. I provided simple, easy-to-use commands so that everyone can understand how to interact with my website.
                    <br>
                    Please feel free to provide any feedback via my email, which you can find when you type 'contact' in the input field.</font>
                    <br><br>
                    <strong>Did you know that your website is vulnerable to XSS?</strong><br>
                    <font size="-1">Yes, I know. I don't care enough to fix it because my website doesn't handle any sort of PII or any other important
                    information to be stolen other than my personal pictures in here and my resume. Maybe my email if you want to include
                    that too, but I really don't care. If my portfolio does handle such things, I would've taken care of it already and 
                    you wouldn't be messaging me about it. Please stop bugging me in my DMs about this.</font>
                    <br><br>
                    <strong>Did you create your portfolio all by yourself?</strong><br>
                    <font size="-1">No. I did most of the HTML and CSS, while my friend <a href="https://twitter.com/kvncnls" rel="noopener noreferrer" target="_blank">Kevin</a>
                    helped me write the JavaScript to make my website act like a terminal. After creating the skeleton of the JavaScript, I modified his code
                    to include the output results I want written (like what you're currently reading) when people type certain words and then a few other things 
                    as well. If you want to see his work, you can click the link in his bio to see his website, his social medias, and other stuff. I've placed 
                    a link to his Twitter in here so you can go and click on his name to check out his twitter feed and follow him. Thank you Kevin!! &#128519;</font>
                    <br><br>
                    <strong>How did you create your website? I want to do the same thing for mine.</strong><br>
                    <font size="-1">HTML5, CSS, JavaScript, Google Domains, GitHub, and a lot of heavy research. W3Schools and stackoverflow are both some of the resources I used
                    the most. If you're going to ask me to give you a snippet of my code for "testing purposes" so that my site isn't vulnerable to your
                    "hacking", the answer is &#128150;no&#128150;</font>
                    <br><br>
            </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "about":
            addPreviousCmd();

            results.innerHTML = `
                <div class="about">
                    <ul class="list">
                    <br>
                        Hi! I'm Kristina, but you may also call me Tina. &#127872;<br><br> 
                        I was born and raised in New York City. &#128509;<br><br>
                        My favorite season of the year is fall &#127810;.<br><br>
                        I have a passion for learning languages and cultures and spend my free time by doing so. I am currently 
                        teaching myself French (primarily) and occassionally learning Arabic. I hope to learn 
                        more languages in the future while also having the opportunity to travel to their
                        respective countries as well. &#127758;<br><br>
                        I like to spend my free time is by attempting to do some CTFs through TryHackMe or HackTheBox, 
                        reading some books for leisure, singing my heart out to Ariana Grande's songs, playing Chess, or 
                        watching a TV series/a movie. Here are some of my favorite shows I've watched so far:<br><br>
                        <li>HIMYM</li>
                        <li>Mr. Robot</li>
                        <li>Demon Slayer</li>
                        <li>Bridgerton</li><br><br>
                        I was inspired to pursue a career in Information Security after watching Mr. Robot. 
                        Now, I work in my dream role as a Cloud & DevOps Security Engineer. 
                        My current goal is to gain more professional experiences as a programmer as work on getting certified in 
                        AWS Solutions Architect, AWS Security Specialty, and CISSP while I strive to be a Staff Engineer.
                        <br><br>
                    </ul>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "socials":
            addPreviousCmd();

            results.innerHTML = `
                <div class="socials-list">
                    <ul class="list">
                    Here are some links to my social media accounts. You're welcome to follow me and get to know me on a
                    personal level! &#128519;<br><br>
                        <li> </li>
                        <li><a href="https://www.linkedin.com/in/kristinamarielag/" rel="noopener noreferrer" target="_blank">linkedin</a> -> <font size=-7>&nbsp;*please make sure to leave a message stating why you want to connect*</font></li>
                        <li><a href="https://github.com/xtinamarie" rel="noopener noreferrer" target="_blank">github</a></li>
                        <li><a href="https://twitter.com/tinyxtina_" rel="noopener noreferrer" target="_blank">twitter</a></li>
                        <li><a href="https://www.tiktok.com/@xtina3.0" rel="noopener noreferrer" target="_blank">tiktok</a></li>
                        <li><a href="https://www.youtube.com/@tinyxtina_" rel="noopener noreferrer" target="_blank">youtube</a></li><br>
                    </ul>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "contact":
            addPreviousCmd();

            results.innerHTML = `
                <div class="contact">
                <br>
                    Please don't hesitate to reach out to me via social media if you wanna chat! Just type 'socials' and it will lead you to my social media platforms. <br><br>
                    For business inquiries, please contact me via <a href="https://www.linkedin.com/in/kristinamarielag/" rel="noopener noreferrer" target="_blank">LinkedIn</a> and leave a message or you may request for my email. &#128231; <br><br>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "writeup":
            addPreviousCmd();

            results.innerHTML = `
                <div class="writeup">
                    <ul class="list">
                    <br>
                        No writeups here, yet. Please check back later! &#128522;
                    <br><br>
                    </ul>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "resume":
            addPreviousCmd();

            results.innerHTML = `
                <div class="resume">
                <br>
                Resume update coming soon! &#128196;&#128526;
                    <br><br>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "hack":
            addPreviousCmd();

            results.innerHTML = `
                <div class="hack">
                    <br>
                    So, you're trying to hack me, eh? &#128527; <br>
                    Can you find my not so secret blog page?<br><br>
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "clear":
            addPreviousCmd();

            outputList.innerHTML = ``;
            break;
        
        default:
            addPreviousCmd();
            templateString = `
            <br>
            zsh:  command not found: ${inputField.value}
            <br><br>
            Please type one of the words from the following list to see more.
            <br><br>
            ['about', 'socials', 'contact', 'writeup', 'resume', 'pics', 'hack', 'faq', 'clear']
            `

            results.innerHTML = templateString;

            // Add results to output box
            outputList.appendChild(results);
    }

    function addPreviousCmd() {
        let previousNode = document.createTextNode(inputField.value);
        let history = document.createElement('p');
        history.classList.add('pre');
        history.appendChild(previousNode);
        outputList.appendChild(history);
    }

    // Empty out the input field
    inputField.value = '';
}

function logSubmit(event) {
    // Prevent default form submission action
    event.preventDefault();

    // Add input value to history
    historyList.push(inputField.value);
    historyPosition++;

    // Show output box
    outputBox.style.display = "block";

    // Create new li element
    createListItem();
}

formElement.addEventListener('submit', logSubmit);

formElement.addEventListener('keydown', (e) => {
    // If the historyList array has at least 1 item:
    if (historyList.length) {

        // Up Arrow Key Pressed
        if (e.code == "ArrowUp") {
            historyPosition --;
            // History position stops at 0
            if (historyPosition < 0) {
                historyPosition = 0;
                inputField.value = historyList[historyPosition];
            } else {
                inputField.value = historyList[historyPosition];
            }
        }
        // Down Arrow Key Pressed
        else if (e.code == "ArrowDown") {
            historyPosition ++;
            if (historyPosition > historyList.length - 1) {
                historyPosition = historyList.length - 1;
                inputField.value = historyList[historyPosition];
            } else {
                inputField.value = historyList[historyPosition];
            }
        }
    }
});