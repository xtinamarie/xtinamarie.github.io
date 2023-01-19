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
                        Hi! My name is Kristina Marie, but you may call me Kristina or Tina. &#127872;<br><br> 
                        I was born and raised in New York City. My favorite colors are red and lavender. I am happily married
                        to my amazing husband since September 5, 2020. We have 5 cats whose names are Artemis, Zeus, Athena, 
                        Hera, and Luna. If you'd like to see pictures of them, just type the word 'pics' and you'll see how
                        cute they are! My favorite season of the year is fall &#127810;.<br><br>
                        Prior to my college years, I attended Fiorello H. LaGuardia High School of Music, Arts, and Performing Arts
                        as a vocal major. In the beginning, I thought I wanted to pursue a career in singing. However,
                        that changed once I started my junior year and realized I wanted to pursue a career in STEM.
                        Growing up in a Filipino household and being surrounded by many nurses in my family, I thought medicine
                        was the right career path for me. So then, I chose to a pursue a career in becoming an anesthesiologist. 
                        I attended Molloy College for two years and majored in Biology (Pre-Medicine) with a double minor in 
                        Chemistry and Mathematics. I soon realized that medicine was not meant to be my career path.<br><br>
                        For a short amount of time, I struggled to figure out what I wanted to do in life, but I remembered 
                        being in a STEM program that City College CUNY had hosted for high school students. Through 
                        that program, my team and I built/programmed a prototype robot that was designed to save lives 
                        for the US Army to use. Because of that program, I was inspired to change my major to Computer Science
                        and Information Security and transferred to John Jay College of Criminal Justice. Since then, I have 
                        not looked back in the decision I made.<br><br>
                        I have a passion for learning languages and cultures and spend my free time by doing so. I am currently 
                        teaching myself French (primarily) and frequently learning Chinese and Japanese. I hope to learn 
                        Korean, Italian, and Spanish in the future while also having the opportunity to travel to their
                        respective countries as well. &#127758;<br><br>
                        Another way I like to spend my free time is by learning more programming languages, attempting to do
                        some CTFs through TryHackMe or HackTheBox, reading some books for leisure, singing my heart out to
                        Ariana Grande/Whitney Houston/Christina Aguilera/Celine Dion songs, or watching one of the following
                        TV shows:<br><br>
                        <li> </li>
                        <li>Grey's Anatomy</li>
                        <li>Mr. Robot</li>
                        <li>HIMYM</li>
                        <li>Anime shows</li><br><br>
                        After initially watching Mr. Robot, I knew I definitely wanted to pursue a career in Information
                        Security. Now, I work as a Software Developer. My current goal is to gain more professional experiences
                        as a programmer as work on getting certified in AWS Cloud Practitioner, Network+, Security+, 
                        and CISSP so that I can achieve my dream role as a Security Engineer.
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
        
        case "pics":
            addPreviousCmd();

            results.innerHTML = `
                <div class="pics">
                <br>
                    <ul class="list">
                    Hi there! So you want to see some pictures... &#128527;<br>
                    Here is a picture of me and another picture of me and my husband:<br>
                    <img src="static/img/me.jpeg" alt="A picture of me."><br> 
                    <img src="static/img/me_and_jp.jpeg" alt="A picture of me and my husband, JP."><br><br>
                    Now, here are the pics that you're REALLY here for &#128514;<br><br>
                    This is a picture of Artemis. He's my first baby. He was born on April 15, 2020.
                    <img src="static/img/arty.jpeg" alt="Artemis">
                    The story began when one of my close friends (whom I used to work with at Microsoft) had some outdoor 
                    cats constantly visiting his home. He wasn't allowed to take the cats into his home, but he did his best
                    in taking care of them however he could. He provided them with food and a place outside to sleep and take
                    shelter. He didn't realize that one of them was pregnant, until he heard tiny meows. Here is a picture of
                    Arty when he was a baby with his siblings.<br>
                    <img src="static/img/babyarty.jpeg" alt="Baby Arty and his siblings">
                    Don't worry. His siblings are safe. My former coworkers, who also worked at Microsoft, took in Artemis's
                    siblings and we still keep in touch. &#128519;
                    <br><br>
                    The next picture is a picture of Zeus (white/tan) located at the top right of the picture.
                    Although Zeus is younger than Artemis (born on July 11, 2020), Artemis's grandmother 
                    gave birth to Zeus. I guess that makes Zeus his uncle? &#128517; <br>
                    The two kittens next to Zeus are Artemis's daughters: Athena (grey/white/tan) and Hera (black/brown). 
                    <br>They were both born on May 11, 2021.<br>
                    <img src="static/img/zah.jpeg" alt="Zeus, Athena, and Hera">
                    Here is a picture of Luna &#8212; another one of Artemis's daughters. (Peep Arty in the back &#128517;)<br>
                    <img src="static/img/luna.jpeg" alt="Luna">
                    This last picture is a picture of all the kittens along with their mother, Mingming, who is currently living
                    with my best friend. The other two kittens, who I didn't mention, are named Simba (all tan) and Seraphine (all grey).
                    They also currently are safe and living with my best friend and Mingming.
                    <br>
                    <img src="static/img/kittens.jpeg" alt="Mingming and the kittens">
                    </ul>
                    <br>
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