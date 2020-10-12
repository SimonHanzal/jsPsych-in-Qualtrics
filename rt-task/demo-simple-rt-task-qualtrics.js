Qualtrics.SurveyEngine.addOnload(function () {
	/* METADATA */
	
	var timeline = [];
	var no_trials = 3;
	var repo_site = "https://simonhanzal.github.io/prototype/";

    /* WELCOME */
    
	var welcome = {
      type: "html-keyboard-response",
      stimulus: "Welcome to the prototype experiment. Press any key to begin."
    };
    timeline.push(welcome);

    /* INSTRUCTIONS */
    
	var instructions = {
      type: "html-keyboard-response",
      stimulus: "<p>In this experiment, a number will appear in the center " +
          "of the screen.</p><p>If the number is <strong>3</strong>, " +
          "do not press anything.</p>" +
          "<p>If it is any other number between <strong>1-9</strong>, press the Space Bar " +
          "as fast as you can.</p>" +
          "<p>Press any key to begin.</p>",
      post_trial_gap: 2000
    };
    timeline.push(instructions);

    /* TRIALS */
	
	var test_stimuli = [
      { stimulus: '<div style="font-size:60px;">1</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">2</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">3</div>', data: { test_part: 'test', correct_response: 'None' } },
      { stimulus: '<div style="font-size:60px;">4</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">5</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">6</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">7</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">8</div>', data: { test_part: 'test', correct_response: 'Space' } },
	  { stimulus: '<div style="font-size:60px;">9</div>', data: { test_part: 'test', correct_response: 'Space' } }
    ];

    var fixation = {
      type: 'html-keyboard-response',
      stimulus: "<p></p>",//'<div style="font-size:60px;">+</div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 50,
      data: {test_part: 'fixation'}
    }

    var test = {
      type: "html-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'),
      choices: ['f1','Space'],
	  stimulus_duration: 250,
	  trial_duration: 1100,
	  response_ends_trial: false,
      data: jsPsych.timelineVariable('data'),
	  on_finish: function(data){
		data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
		data.three = data.stimulus == '<div style="font-size:60px;">3</div>';
	},
    }

    var test_procedure = {
      timeline: [fixation, test],
      timeline_variables: test_stimuli,
      repetitions: no_trials,
	  randomize_order: true
    }
	timeline.push(test_procedure);
	
	var debrief_block = {
	    type: "html-keyboard-response",
	    stimulus: function() {
			
		/* BASIC NUMBER CALCULATIONS */
		
		var trials = jsPsych.data.get().filter({test_part: 'test'});
		var correct_trials = trials.filter({correct: true});
		var correct_relevant = correct_trials.filter({three: true});
		var go_trials = trials.filter({three: false});
		var correct_go_trials = correct_trials.filter({three: false});

		var correct_no_go = correct_relevant.count();
		var incorrect_no_go = no_trials - correct_relevant.count();
		var correct_go = correct_trials.count() - correct_no_go;
		var incorrect_go = no_trials * 8 - correct_go;
		
		/* ANALYTIC CALCULATIONS */
		
		var accuracy = Math.round(correct_trials.count() / trials.count() * 10000) / 100;
		
		var minimum = Math.round(correct_go_trials.select('rt').min());
		var maximum = Math.round(correct_go_trials.select('rt').max());
		
		var trial_data1 = Object.entries(correct_go_trials.select('rt'));
		var trial_data2 = trial_data1.slice(0,1).toString();
		var trial_data3 = trial_data2.split(",");
		var trial_data_array = trial_data3.slice(1);
		var trial_data_word = trial_data_array.join(";");
		
		var rt = Math.round(correct_trials.select('rt').mean());
		var true_rt = Math.round(correct_go_trials.select('rt').mean()*100)/100;
		var no_go_rt = Math.round(correct_relevant.select('rt').mean());
		var sd1 = trial_data_array.map(fc);

		function fc(value) {
		const mean = true_rt
		return (value - true_rt) ** 2;
		}
		var sd2 = sd1.reduce((a,b) => a + b, 0);
		var sd3 = sd2/sd1.length;
		var sd4 = Math.sqrt(sd3);
		var deviation = Math.round(sd4*100)/100;
			
			return "<p> The total number of trials was " +trials.count()+".</p>" +
			"<p>The number of correct go trials was " +correct_go+".</p>" +
			"<p>The number of incorrect go trials was " +incorrect_go+ ".</p>" +
			"<p>The number of correct no-go trials was " +correct_no_go+ ".</p>" +
			"<p>The number of incorrect no-go trials was " +incorrect_no_go+ ".</p>" +
			"<p>The accuracy was "+accuracy+"%.</p>" +
			"<p>The mean trial speed was "+true_rt+"ms.</p>"+
			"<p>The reaction time range was between "+minimum+"ms and "+maximum+"ms.</p>"+
			"<p>The standard deviation was "+deviation+"ms.</p>"+
			"<p>DEBUG INFORMATION:</p>"+
			"<p>These are the individual trial RT results: "+trial_data_array+" (ms).</p>"+
			"<p>These are the individual trial RT results in word form: "+trial_data_word+" (ms).</p>"+
			"<p>The mean response time was "+rt+"ms for correct trials including 0ms logged for all no go trials.</p>"+
			"<p>The number of correct go trials was "+go_trials.count()+".</p>"+
			"<p>The number of correct trials was "+correct_trials.count()+".</p>"+
			"<p>Mean logged response time for no go trials: "+no_go_rt+"ms.</p>"+
			"<p>Number of trials taken for RT calculation: "+correct_go_trials.count()+"ms.</p>" +
			"<p></p>"+
			"<p>Press any key to complete the experiment. Thank you!</p>";
		
		}
	};
	timeline.push(debrief_block);
 
 /* Change 1: Hiding the Next button */
    // Retrieve Qualtrics object and save in qthis
    var qthis = this;

    // Hide buttons
    qthis.hideNextButton();

    /* Change 2: Defining and load required resources */
    var task_github = "https://simonhanzal.github.io/prototype/"; // https://<your-github-username>.github.io/<your-experiment-name>

    // requiredResources must include all the JS files that demo-simple-rt-task-transformed.html uses.
    var requiredResources = [
        task_github + "jspsych-6.1.0/jspsych.js",
        task_github + "jspsych-6.1.0/plugins/jspsych-html-keyboard-response.js",
        task_github + "jspsych-6.1.0/plugins/jspsych-image-keyboard-response.js",
        task_github + "rt-task_main.js"
    ];

    function loadScript(idx) {
        console.log("Loading ", requiredResources[idx]);
        jQuery.getScript(requiredResources[idx], function () {
            if ((idx + 1) < requiredResources.length) {
                loadScript(idx + 1);
            } else {
                initExp();
            }
        });
    }

    if (window.Qualtrics && (!window.frameElement || window.frameElement.id !== "mobile-preview-view")) {
        loadScript(0);
    }

    /* Change 3: Appending the display_stage Div using jQuery */
    // jQuery is loaded in Qualtrics by default
    jQuery("<div id = 'display_stage_background'></div>").appendTo('body');
    jQuery("<div id = 'display_stage'></div>").appendTo('body');

    /* Change 4: Wrapping jsPsych.init() in a function */
    function initExp() {

        jsPsych.init({
            timeline: timeline,
            display_element: 'display_stage',
            on_finish: function (data) {
                /* Change 5: Summarizing and save the results to Qualtrics */
                // summarize the results
                var trials = jsPsych.data.get().filter({
                    test_part: 'test'
                });
                var correct_trials = trials.filter({
                    correct: true
                });
                var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
                var rt = Math.round(correct_trials.select('rt').mean());

                // save to qualtrics embedded data
                Qualtrics.SurveyEngine.setEmbeddedData("accuracy", accuracy);
                Qualtrics.SurveyEngine.setEmbeddedData("rt", rt);

                /* Change 6: Adding the clean up and continue functions.*/
                // clear the stage
                jQuery('#display_stage').remove();
                jQuery('#display_stage_background').remove();

                // simulate click on Qualtrics "next" button, making use of the Qualtrics JS API
                qthis.clickNextButton();
            }
        });
    }
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/

});
