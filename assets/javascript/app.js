const TriviaGame = function() {
    
    let   intervalID;
    const numQuestions = 10, numChoicesPerQuestion = 4;
    const timeAllowed = 90, timeWarning = 30;
    
  
    let timeLeft;
    let answers, answers_user = new Array(numQuestions);

   
    const api_url = `https://opentdb.com/api.php?amount=${numQuestions}&type=multiple`;
    

  
    this.startNewGame = function() {
        displayPage(0);
    }

    this.startQuiz = function() {
       
        answers = new Array(numQuestions);

        for (let i = 0; i < numQuestions; i++) {
            answers_user[i] = -1;
        }
        
    
        $("#question, #timer, #button_submit").css({"display": "none"});
        resetTimer();
        displayPage(1);

        $.getJSON(api_url, json => {
        
            const output = parseData((json.response_code === 0) ? json.results : sampleResults);

            
            updateDOM(output);

           
            displayQuestions();
        });
    }

    function gradeQuiz() {
        clearInterval(intervalID);

        let numCorrectAnswers = 0;

        for (let i = 0; i < numQuestions; i++) {
            if (answers_user[i] === answers[i].index) {
                numCorrectAnswers++;
            }
        }

        $("#numCorrectAnswers").text(numCorrectAnswers);
        $("#numQuestions").text(numQuestions);
        displayPage(2);
    }

    
    
    function displayPage(page) {
        $(".page").css({"display": "none"});
        $(`.page:nth-of-type(${page + 1})`).css({"display": "block"});
    }

    function displayQuestions() {
        $("#question, #timer, #button_submit").css({"display": "block"});

        resetTimer();
        
        intervalID = setInterval(updateTimer, 1000);
    }


 
    function updateTimer() {
        timeLeft--;

        $("#timer").text(timeLeft);
        if (timeLeft <= timeWarning && $("#timer").css("animation-name") !== "shake") {
            $("#timer").css({"animation": "shake 0.80s cubic-bezier(.36, .07, .19, .97) both"});
        }
        $("#timer").replaceWith($("#timer").clone());
        
        if (timeLeft === 0) {
            gradeQuiz();
        }
    }

    function resetTimer() {
        timeLeft = timeAllowed;

        $("#timer").text(timeLeft);
        $("#timer").css({"animation": "spin 0.50s cubic-bezier(.15, .07, .20, .97) both"});
    }


 
    function parseData(data) {
        let output = "";
        
      
        let i, j, choices;
        
        for (i = 0; i < numQuestions; i++) {
          
            const index = data[i].category.indexOf(":");

            if (index >= 0) {
              
                data[i].category = data[i].category.substring(index + 2, data[i].category.length);
            }

         
            choices = data[i].incorrect_answers;
            
            answers[i] = {
                "index": Math.floor(numChoicesPerQuestion * Math.random()),
                "value": data[i].correct_answer
            };
            
            choices.splice(answers[i].index, 0, answers[i].value);
            
            // Write to HTML
            output += `<div class=\"questions\" id=\"q${i}\">
                       <div class=\"category\"><p>${data[i].category}</p></div>
                       <div class=\"prompt\"><p>Question ${i + 1}. ${data[i].question}</p></div>`;

            for (j = 0; j < numChoicesPerQuestion; j++) {
                output += `<div class=\"choices choices_q${i}\">${String.fromCharCode(65 + j)}. ${choices[j]}</div>`;
            }

            output += "</div>";
        }

        return output;
    }

    function updateDOM(output) {
       
        $("#question").html(output);

       
        $(".choices").on("click", function() {
           
            const index           = $(".choices").index(this);
            const answer          = index % numChoicesPerQuestion;
            const currentQuestion = (index - answer) / numChoicesPerQuestion;

            answers_user[currentQuestion] = answer;

            $(`.choices_q${currentQuestion}`).css({
                "background-color": "var(--color-background)",
                "color"           : "var(--color-text)"
            });
           
            $(`.choices_q${currentQuestion}:nth-of-type(${answer + 3})`).css({
                "background-color": "var(--color-light-blue)",
                "color"           : "var(--color-text-contrast)"
            });
        });

        $("#button_submit").on("click", gradeQuiz);
    }
}




let game;

$(document).ready(function() {
    game = new TriviaGame();

    game.startNewGame();

    $("#button_start").on("click", game.startQuiz);

    $("#button_restart").on("click", game.startNewGame);
});