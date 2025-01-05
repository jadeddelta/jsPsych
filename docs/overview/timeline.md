# Creating an Experiment: The Timeline

To create an experiment using jsPsych, you need to specify a timeline that describes the structure of the experiment. The timeline is an ordered set of trials. You must create the timeline before launching the experiment. Most of the code you will write for an experiment will be code to create the timeline. This page walks through the creation of timelines, including very basic examples and more advanced features.

## A single trial

To create a trial, you need to create an object that describes the trial. The most important feature of this object is the `type` parameter. This tells jsPsych which plugin to use to run the trial. For example, if you want to use the [html-keyboard-response plugin](../plugins/html-keyboard-response.md) to display a short message, the trial object would look like this:

```javascript
const trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Welcome to the experiment.'
}
```

The parameters for this object (e.g., `stimulus`) will depend on the plugin that you choose. Each plugin defines the set of parameters that are needed to run a trial with that plugin. Visit the documentation for a plugin to learn about the parameters that you can use with that plugin.

To create a timeline with the single trial and run the experiment, just embed the trial object in an array. A timeline can simply be an array of trials.

```javascript
const timeline = [trial];

jsPsych.run(timeline);
```

To create and run a simple experiment like this complete the [hello world tutorial](../tutorials/hello-world.md).

## Multiple trials

Scaling up to multiple trials is straightforward. Create an object for each trial, and add each object to the timeline array.

```javascript
// with lots of trials, it might be easier to add the trials
// to the timeline array as they are defined.
const timeline = [];

const trial_1 = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This is trial 1.'
}
timeline.push(trial_1);

const trial_2 = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This is trial 2.'
}
timeline.push(trial_2);

const trial_3 = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This is trial 3.'
}
timeline.push(trial_3);
```

## Nested timelines

Each object on the timeline can also have its own timeline. This is useful for many reasons. One is that it allows you to define common parameters across trials once and have them apply to all the trials on the nested timeline. The example below creates a series of trials using the [image-keyboard-response plugin](../plugins/image-keyboard-response.md), where the only thing that changes from trial-to-trial is the image file being displayed on the screen.

```javascript
const judgment_trials = {
	type: jsPsychImageKeyboardResponse,
	prompt: '<p>Press a number 1-7 to indicate how unusual the image is.</p>',
	choices: ['1','2','3','4','5','6','7'],
	timeline: [
		{stimulus: 'image1.png'},
		{stimulus: 'image2.png'},
		{stimulus: 'image3.png'}
	]
}
```

In the above code, the `type`, `prompt`, and `choices` parameters are automatically applied to all of the objects in the `timeline` array. This creates three trials with the same `type`, `prompt`, and `choices` parameters, but different values for the `stimulus` parameter.

You can also override the values by declaring a new value in the `timeline` array. In the example below, the second trial will display a different prompt message.

```javascript
const judgment_trials = {
	type: jsPsychImageKeyboardResponse,
	prompt: '<p>Press a number 1-7 to indicate how unusual the image is.</p>',
	choices: ['1','2','3','4','5','6','7'],
	timeline: [
		{stimulus: 'image1.png'},
		{stimulus: 'image2.png', prompt: '<p>Press 1 for this trial.</p>'},
		{stimulus: 'image3.png'}
	]
}
```

Timelines can be nested any number of times.

## Timeline variables

A common pattern in behavioral experiments is to repeat the same procedure/task many times with slightly different parameters. A procedure might be a single trial, but it also might be a series of trials. For example, a task might involve a fixation cross appearing, followed by a blank screen, followed by an image for a short duration, followed by a prompt and a text box to report on some aspect of the image.

One shortcut to implement this pattern is with the nested timeline approach described in the previous section, but this only works if all the trials use the same plugin type. Timeline variables are a more general solution. With timeline variables you define the procedure once (as a timeline) and specify a set of parameters and their values for each iteration through the timeline.

What follows is an example of how to use timeline variables. The [simple reaction time tutorial](../tutorials/rt-task.md) also explains how to use timeline variables.

Suppose we want to create an experiment where people see a set of faces. Perhaps this is a memory experiment and this is the phase of the experiment where the faces are being presented for the first time. In between each face, a fixation cross is displayed on the screen. Without timeline variables, we would need to add many trials to the timeline, alternating between trials showing the fixation cross and trials showing the face and name. This could be done efficiently using a loop or function to create the timeline, but timeline variables make it even easier - as well as adding extra features like sampling and randomization.

Here's a basic version of the task with timeline variables.

```javascript
const face_name_procedure = {
	timeline: [
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '+',
			choices: "NO_KEYS",
			trial_duration: 500
		},
		{
			type: jsPsychImageKeyboardResponse,
			stimulus: jsPsych.timelineVariable('face'),
			choices: "NO_KEYS",
			trial_duration: 2500
		}
	],
	timeline_variables: [
		{ face: 'person-1.jpg' },
		{ face: 'person-2.jpg' },
		{ face: 'person-3.jpg' },
		{ face: 'person-4.jpg' }
	]
}
```

In the above version, there are four separate trials defined in the `timeline_variables` parameter. Each trial has a variable `face` and a variable `name`. The `timeline` defines a procedure of showing a fixation cross for 500ms followed by the face and name for 2500ms.  This procedure will repeat four times, with the first trial showing `'person-1.jpg'`, the second `'person-2.jpg'`, and so on. The variables are referenced within the procedure by calling the `jsPsych.timelineVariable()` method and passing in the name of the variable.

What if we wanted to add an additional step to the task where the name is displayed prior to the face appearing? (Maybe this is one condition of an experiment investigating whether the order of name-face or face-name affects retention.) We can add another variable to our list that gives the name associated with each image. Then we can add another trial to our timeline to show the name.

```javascript
const face_name_procedure = {
	timeline: [
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '+',
			choices: "NO_KEYS",
			trial_duration: 500
		},
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: jsPsych.timelineVariable('name'),
			trial_duration: 1000,
			choices: "NO_KEYS"
		},
		{
			type: jsPsychImageKeyboardResponse,
			stimulus: jsPsych.timelineVariable('face'),			
			choices: "NO_KEYS",
			trial_duration: 1000
		}
	],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	]
}
```

### Using timeline variables in a function

Continuing the example from the previous section, what if we wanted to show the name with the face, combining the two variables together? 
To do this, we can use a [dynamic parameter](dynamic-parameters.md) (a function) to create an HTML-string that uses both variables in a single parameter.
However, because we are getting the value of a timeline variable in a function, we need to use `jsPsych.evaluateTimelineVariable()` instead of `jsPsych.timelineVariable()`. Calling `.evaluateTimelineVariable()` immediately gets the value of the variable, while `.timelineVariable()` creates a placeholder that jsPsych evaluates at the appropriate time during the execution of the experiment.
The value of the `stimulus` parameter will be a function that returns an HTML string that contains both the image and the name. 

```javascript
const face_name_procedure = {
	timeline: [
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '+',
			choices: "NO_KEYS",
			trial_duration: 500
		},
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: jsPsych.timelineVariable('name'),
			trial_duration: 1000,
			choices: "NO_KEYS"
		},
		{
			type: jsPsychHtmlKeyboardResponse,
			stimulus: function(){
				const html = `
					<img src="${jsPsych.evaluateTimelineVariable('face')}">
					<p>${jsPsych.evaluateTimelineVariable('name')}</p>`;
				return html;
			},			
			choices: "NO_KEYS",
			trial_duration: 2500
		}
	],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	]
}
```

### Random orders of trials

If we want to randomize the order of the trials defined with timeline variables, we can set `randomize_order` to `true`.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	randomize_order: true
}
```

### Sampling methods

There are also sampling methods that can be used to select a set of trials from the timeline_variables.
Sampling is declared by creating a `sample` parameter. 
The `sample` parameter is given an object of arguments. 
The `type` parameter in this object controls the type of sampling that is done. 
Valid values for `type` are:

* `"with-replacement"`: Sample `size` items from the timeline variables with the possibility of choosing the same item multiple time.
* `"without-replacement"`: Sample `size` items from timeline variables, with each item being selected a maximum of 1 time.
* `"fixed-repetitons"`: Repeat each item in the timeline variables `size` times, in a random order. Unlike using the `repetitons` parameter, this method allows for consecutive trials to use the same timeline variable set.
* `"alternate-groups"`: Sample in an alternating order based on a declared group membership. Groups are defined by the `groups` parameter. This parameter takes an array of arrays, where each inner array is a group and the items in the inner array are the indices of the timeline variables in the `timeline_variables` array that belong to that group.
* `"custom"`: Write a function that returns a custom order of the timeline variables.

#### Sampling with replacement

This `sample` parameter will create 10 repetitions, sampling with replacement.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'with-replacement',
		size: 10
	}
}
```

#### Sampling with replacement, unequal probabilities

This `sample` parameter will make the "Alex" trial three times as likely to be sampled as the others.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'with-replacement',
		size: 10, 
		weights: [3, 1, 1, 1]
	}
}
```

#### Sampling without replacement

This `sample` parameter will pick three of the four possible trials to run at random.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'without-replacement',
		size: 3 
	}
}
```

#### Repeating each trial a fixed number of times in a random order

This `sample` parameter will create 3 repetitions of each trial, for a total of 12 trials, with a random order.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'fixed-repetitions',
		size: 3
	}
}
```

#### Alternating groups

This `sample` parameter puts the "Alex" and "Chad" trials in group 1 and the "Beth" and "Dave" trials in group 2. 
The resulting sample of trials will follow the pattern `group 1` -> `group 2` -> `group 1` -> `group 2`.
 Each trial will be selected only one time. 
If you wanted `group 2` to sometimes be first, you could set `randomize_group_order: true`.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'alternate-groups',
		groups: [[0,2],[1,3]],  
		randomize_group_order: false
	}
}
```

#### Custom sampling function

Any sampling method can be implemented using the `custom` type sampler. 
The order of trials will be determined by running the function supplied as `fn`. 
The function has a single parameter, `t`, which is an array of integers from `0` to `n-1`, where `n` is the number of trials in the `timeline_variables` array. 
The function must return an array that specifies the order of the trials, e.g., returning `[3,3,2,2,1,1,0,0]` would result in the order `Dave` -> `Dave` -> `Chad` -> `Chad` -> `Beth` -> `Beth` -> `Alex` -> `Alex`.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'custom',
		fn: function(t){
			return t.reverse(); // show the trials in the reverse order
		}
	}
}
```

## Repeating a set of trials

To repeat a timeline multiple times, you can create an object (node) that contains a `timeline`, which is the timeline array to repeat, and `repetitions`, which is the number of times to repeat that timeline. 

```javascript
const trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This trial will be repeated twice.'
}

const node = {
	timeline: [trial],
	repetitions: 2
}
```

The `repetitions` parameter can be used alongside other node parameters, such as timeline variables, loop functions, and/or conditional functions. If you are using `timeline_variables` and `randomize_order` is `true`, then the order of the timeline variables will re-randomize before every repetition.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	randomize_order: true,
	repetitions: 3 
}
```

## Looping timelines

Any timeline can be looped using the `loop_function` option. 
The loop function must be a function that evaluates to `true` if the timeline should repeat, and `false` if the timeline should end. 
It receives a single parameter, named `data` by convention. 
This parameter will be the [DataCollection object](../reference/jspsych-data.md#datacollection) with all of the data from the trials executed in the last iteration of the timeline. 
The loop function will be evaluated after the timeline is completed.

```javascript
const trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This trial is in a loop. Press R to repeat this trial, or C to continue.'
}

const loop_node = {
	timeline: [trial],
	loop_function: function(data){
		if(jsPsych.pluginAPI.compareKeys(data.values()[0].response, 'r')){
			return true;
		} else {
			return false;
		}
	}
}
```

## Conditional timelines

A timeline can be skipped or not based on the evaluation of the `conditional_function` option. 
If the conditional function evaluates to `true`, the timeline will execute normally. 
If the conditional function evaluates to `false` then the timeline will be skipped. 
The conditional function is evaluated whenever jsPsych is about to run the first trial on the timeline.

If you use a conditional function and a loop function on the same timeline, the conditional function will only evaluate once.

```javascript
const jsPsych = initJsPsych();

const pre_if_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'The next trial is in a conditional statement. Press S to skip it, or V to view it.'
}

const if_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'You chose to view the trial. Press any key to continue.'
}

const if_node = {
	timeline: [if_trial],
	conditional_function: function(){
		// get the data from the previous trial,
		// and check which key was pressed
		const data = jsPsych.data.get().last(1).values()[0];
		if(jsPsych.pluginAPI.compareKeys(data.response, 's')){
			return false;
		} else {
			return true;
		}
	}
}

const after_if_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'This is the trial after the conditional.'
}

jsPsych.run([pre_if_trial, if_node, after_if_trial]);
```

## Modifying timelines at runtime

Although this functionality can also be achieved through a combination of the `conditional_function` and the use of dynamic variables in the `stimulus` parameter, our timeline implementation allows you to dynamically add or remove trials and nested timelines during runtime.

### Adding timeline nodes at runtime
For example, you may have a branching point in your experiment where the participant is given 3 choices, each leading to a different timeline: 

```javascript
const jspsych = initJsPsych();
let main_timeline = [];

const part1_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Part 1'
}

const choice_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Press 1 if you are a new participant. Press 2 for inquiries about an existing experiment run. Press 3 for Spanish.',
	choices: ['1','2','3']
}
```
This would be trickier to implement with the `conditional_function` since it can only handle 2 branches -- case when `True` or case when `False`. Instead, you can modify the timeline by modifying `choice_trial` to dynamically adding a timeline at the end of the choice trial according to the chosen condition:

```javascript
const english_trial1 = {...};
const english_trial2 = {...};
const english_trial3 = {...};
// So on and so forth
const spanish_trial3 = {...};

const english_branch = [b1_t1, b1_t2, b1_t3];
const mandarin_branch = [b2_t1, b2_t2, b2_t3];
const spanish_branch = [b3_t1, b3_t2, b3_t3];

const choice_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Press 1 for English. Press 2 for Mandarin. Press 3 for Spanish.',
	choices: ['1','2','3'],
	on_finish: (data) => {
		switch(data.response) {
			case '1':
				main_timeline.push(english_branch);
				break;
			case '2':
				main_timeline.push(mandarin_branch);
				break;
			case '3':
				main_timeline.push(spanish_branch);
				break;
		}
	}
}
main_timeline.push(part1_trial, choice_trial);
```
During runtime, choices 1, 2 and 3 will dynamically add a different (nested) timeline, `english_branch`, `mandarin_branch` and `spanish_branch` respectively, to the end of the `main_timeline`.

### Removing timeline nodes at runtime

You can also remove upcoming timeline nodes from a timeline at runtime. To demonstrate this, we can modify the above example by adding a 4th choice to `choice_trial` and another (nested) timeline to the tail of `main_timeline`:

```javascript
const choice_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Press 1 for English. Press 2 for Mandarin. Press 3 for Spanish. Press 4 to exit.',
	choices: ['1','2','3', '4'],
	on_finish: (data) => {
		switch(data.response) {
			case '1':
				main_timeline.push(english_branch);
				break;
			case '2':
				main_timeline.push(mandarin_branch);
				break;
			case '3':
				main_timeline.push(spanish_branch);
				break;
			case '4':
				main_timeline.pop();
				break;
		}
	}
}

const part2_timeline = [
	{
		type: JsPsychHtmlKeyboardResponse,
		stimulus: 'Part 2'
	}
	// ...the rest of the part 2 trials
]

main_timeline.push(part1_trial, choice_trial, part2_timeline)
```
Now, if 1, 2 or 3 were chosen during runtime, `part2_timeline` will run after the dynamically added timeline corresponding to the choice (`english_branch` | `mandarin_branch` | `spanish_branch`) has been run; but if 4 was chosen, `part2_timeline` will be removed at runtime, and `main_timeline` will terminate.

### Exception cases for adding/removing timeline nodes dynamically
Adding or removing timeline nodes work as expected when the addition/removal occurs at a future point in the timeline relative to the current executing node, but not if it occurs before the current node. The example above works as expected becaues all the node(s) added (`english_branch` | `mandarin_branch` | `spanish_branch`) or removed (`part2_timeline`) occur at the end of the timeline via `push()` and `pop()`. If a node was added at a point in the timeline that has already been executed, it will not be executed:

```javascript
const choice_trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Press 1 for English. Press 2 for Mandarin. Press 3 for Spanish. Press 4 to exit.',
	choices: ['1','2','3', '4'],
	on_finish: (data) => {
		switch(data.response) {
			case '1':
				main_timeline.splice(0,0,english_branch); // Adds english_branch to the start of main_timeline
				break;
			case '2':
				main_timeline.push(mandarin_branch);
				break;
			
			...

main_timeline.push(part1_trial, choice_trial);
```
In the above implementation of `choice_trial`, choice 1 adds `english_branch` at the start of `main_timeline`, such that `main_timeline = [english_branch, part1_trial, choice_trial]`, but because the execution of `main_timeline` is past the first node at this point in runtime, the newly added `english_branch` will not be executed. Similarly, modifying `case '1'` in `choice_trial` to remove `part1_trial` will not change any behavior in the timeline.

!!! danger
In the case of a looping timeline, adding a timeline node at a point before the current node will cause the current node to be executed again; and removing a timeline node at a point before the current node will cause the next node to be skipped.

## Timeline start and finish functions

You can run a custom function at the start and end of a timeline node using the `on_timeline_start` and `on_timeline_finish` callback function parameters. These are functions that will run when the timeline starts and ends, respectively. 

```javascript
const procedure = {
	timeline: [trial_1, trial_2],
	on_timeline_start: function() {
		console.log('The trial procedure just started.')
	},
	on_timeline_finish: function() {
		console.log('The trial procedure just finished.')
	}
}
```

This works the same way with timeline variables. The `on_timeline_start` and `on_timeline_finish` functions will run when timeline variables trials start and end, respectively.

```javascript
const face_name_procedure = {
	timeline: [...],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	randomize_order: true,
	on_timeline_start: function() {
		console.log('First trial is starting.')
	},
	on_timeline_finish: function() {
		console.log('Last trial just finished.')
	}
}
```

These functions will execute only once if the timeline loops.
