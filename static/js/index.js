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

    const openImgMatch = inputField.value.toLowerCase().match(/^open (artemis|zeus|athena)\.jpg$/);
    if (openImgMatch) {
        const name = openImgMatch[1];
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        addPreviousCmd();
        results.innerHTML = `
            <div class="cat-reveal">
                <img src="static/img/cats/${name}.jpg" alt="${displayName}" class="cat-img"><br>
                Congrats! You've unlocked an Easter Egg. This is my cat, ${displayName}. &#128049;
            </div>
        `;
        outputList.appendChild(results);
        inputField.value = '';
        return;
    }

    const secretFileCmd = inputField.value.toLowerCase().match(/^(cat|less|more|nano|vi|vim)\s+\.definitely_dont_read_this$/);
    if (secretFileCmd) {
        addPreviousCmd();
        const encryptedContent = `-----BEGIN ENCRYPTED MESSAGE-----\ncGF0aCA9IC9zZWNyZXRibG9n\n-----END ENCRYPTED MESSAGE-----`;
        if (secretFileCmd[1] === 'nano' || secretFileCmd[1] === 'vi' || secretFileCmd[1] === 'vim') {
            results.innerHTML = `<div class="ls"><pre>  GNU nano 6.2            .definitely_dont_read_this\n\n${encryptedContent}\n\n\n^G Help      ^X Exit      ^O Write Out ^R Read File</pre></div>`;
        } else {
            results.innerHTML = `<div class="ls"><pre>${encryptedContent}</pre></div>`;
        }
        outputList.appendChild(results);
        inputField.value = '';
        return;
    }

    const bangMatch = inputField.value.match(/^!(\d+)$/);
    if (bangMatch) {
        const index = parseInt(bangMatch[1]) - 1;
        if (index >= 0 && index < historyList.length - 1) {
            inputField.value = historyList[index];
        } else {
            addPreviousCmd();
            results.innerHTML = `<br>zsh: event not found: ${bangMatch[1]}<br><br>`;
            outputList.appendChild(results);
            inputField.value = '';
            return;
        }
    }

    switch (inputField.value.toLowerCase()) {
        case "faq":
            addPreviousCmd();

            results.innerHTML = `
            <div class="faq">
                    Here are some questions I get asked about my page:<br><br>
                    <strong><---Why did I create a terminal style portfolio?---></strong><br>
                    <span style="font-size:0.85em">I chose to create a terminal style portfolio because, as a developer and security engineer, the terminal is
                    something that I and many other developers use in our day-to-day job functions. I created this style portfolio with
                    the intention of allowing my non-tech savvy audience to get a simple feel of what it is like to use one of our daily
                    tools. I provided simple, easy-to-use commands so that everyone can understand how to interact with my website.
                    <br>
                    For any feedback, feel free to reach out via <a href="https://www.linkedin.com/in/kristina-marie/" rel="noopener noreferrer" target="_blank">LinkedIn</a>.</span>
                    <br><br>
                    <strong><---Did you know that your website is vulnerable to XSS?---></strong><br>
                    <span style="font-size:0.85em">Yes, I'm a security engineer...I'm not oblivious. &#128514; I ran the actual risk assessment: static site, no backend, no auth, no stored user data, WAF + CSP sitting in front of it. The blast radius of XSS on a public read-only page with no sensitive data rounds to zero. I made a conscious call. Please stop DMing me about it; this answer is why that section exists.</span>
                    <br><br>
                    <strong><---Did you create your portfolio all by yourself?---></strong><br>
                    <span style="font-size:0.85em">Not entirely and I want to be upfront about that. My friend Kevin built the JavaScript that makes this site behave like a terminal. He did the heavy lifting on that foundation and I'm grateful for it. Over the years I've updated the styling and content, but the core terminal logic is his work. <a href="https://www.kevincanlas.com/" rel="noopener noreferrer" target="_blank">Go check out his site!</a> He's very talented. Thank you Kevin! &#128519;</span>
                    <br><br>
                    <strong><---Can you send me your code? I want to use it for my own site (and definitely not for "hacking" purposes).---></strong><br>
                    <span style="font-size:0.85em">Uhm...my repo is public. Like...it's right there..........................RTFM much??? <img src="static/img/maddy-side-eye.gif" alt="maddy side eye" class="contact-gif"></span>
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
                    Hi, I'm Kristina! You can also call me Tina (that's what my friends and coworkers call me).<br><br>
                    I'm a Cloud & DevOps Security Engineer by day, French student and amateur bookworm by night.<br><br>
                    I was inspired to get into Cyber Security because of a TV show and I've never looked back. I'm the kind of engineer who asks too many questions before writing a single line of code, because I'd rather understand the full picture than patch the wrong problem.<br><br>
                    I care deeply about the work I do and the people I do it with. If something here resonates with you, I'd love to connect.<br>
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
                    <br>
                    Here are some links to my social media accounts. You're welcome to follow me and get to know me! &#128519;<br><br>
                        <li> </li>
                        <li><a href="https://www.linkedin.com/in/kristina-marie/" rel="noopener noreferrer" target="_blank">linkedin</a></li>
                        <li><a href="https://github.com/xtinamarie" rel="noopener noreferrer" target="_blank">github</a></li>
                        <li><a href="https://twitter.com/tinyxtina_" rel="noopener noreferrer" target="_blank">twitter</a></li>
                        <li><a href="https://www.tiktok.com/@xtina3.0" rel="noopener noreferrer" target="_blank">tiktok</a></li><br>
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
                    <img src="static/img/and-i-oop.gif" alt="and i oop" class="contact-gif"><br>
                    Nice try...my personal info stays personal. &#128514;<br><br>
                    For business inquiries, please contact me via <a href="https://www.linkedin.com/in/kristina-marie/" rel="noopener noreferrer" target="_blank">LinkedIn</a> and leave a message.<br><br>
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
                        No writeups here, yet. Please check back later! &#128522;
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
                Resume update coming soon! &#128196;&#128526;
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "hack":
            addPreviousCmd();

            results.innerHTML = `
                <div class="hack">
                    Bold of you. &#128527;<br>
                    Maybe poke around a little more...
                </div>
            `

            // Add results to output box
            outputList.appendChild(results);
            break;
        
        case "cd ..":
            addPreviousCmd();

            results.innerHTML = `
                <div class="cd">
                    This isn't a real terminal...where are you trying to go? The abyss? &#128580;
                </div>
            `;

            outputList.appendChild(results);
            break;

        case "sudo":
            addPreviousCmd();

            results.innerHTML = `
                <div class="sudo">
                    <img src="static/img/u-thought.gif" alt="u thought" class="contact-gif"><br>
                    Who do you think you are? A hacker or something? &#128514;
                </div>
            `;

            outputList.appendChild(results);
            break;

        case "clear":
            addPreviousCmd();

            outputList.innerHTML = ``;
            break;

        case "ls":
            addPreviousCmd();

            results.innerHTML = `
                <div class="ls"><pre>total 10824
-rw-r--r--  1 guest  staff  3571051 May  1 20:09 artemis.jpg
-rw-r--r--  1 guest  staff   572793 May  1 20:09 athena.jpg
-rw-r--r--  1 guest  staff      430 May  1 09:14 favicon.ico
-rw-r--r--  1 guest  staff     4821 May  1 09:14 index.html
drwxr-xr-x  4 guest  staff      128 May  1 09:14 static
-rw-r--r--  1 guest  staff  1506053 May  1 20:10 zeus.jpg</pre></div>
            `;

            outputList.appendChild(results);
            break;

        case "ls -la":
        case "ls -al":
            addPreviousCmd();

            results.innerHTML = `
                <div class="ls"><pre>total 10832
drwxr-xr-x   8 guest  staff      256 May  1 20:10 .
drwxr-xr-x  42 guest  staff     1344 May  1 20:10 ..
-rw-r--r--   1 guest  staff       64 May  1 09:14 .definitely_dont_read_this
-rw-r--r--   1 guest  staff  3571051 May  1 20:09 artemis.jpg
-rw-r--r--   1 guest  staff   572793 May  1 20:09 athena.jpg
-rw-r--r--   1 guest  staff      430 May  1 09:14 favicon.ico
-rw-r--r--   1 guest  staff     4821 May  1 09:14 index.html
drwxr-xr-x   4 guest  staff      128 May  1 09:14 static
-rw-r--r--   1 guest  staff  1506053 May  1 20:10 zeus.jpg</pre></div>
            `;

            outputList.appendChild(results);
            break;

        case "history":
            addPreviousCmd();

            results.innerHTML = `<div class="history">${historyList.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('<br>')}</div>`;

            outputList.appendChild(results);
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
    if (e.code === "Tab") {
        e.preventDefault();
        const parts = inputField.value.split(' ');
        const partial = parts[parts.length - 1];
        if (partial.length > 0 && '.definitely_dont_read_this'.startsWith(partial)) {
            parts[parts.length - 1] = '.definitely_dont_read_this';
            inputField.value = parts.join(' ');
        }
    }

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