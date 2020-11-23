/*
Simjs is a simulation library, maybe not the best, maybe not the most popular, maybe 
not the most performant, but it is a simulation library.
For the moment it has no graphical support, but it is supposed to work.


*/




class Event {
	// Everything happening in the simulation can be represented as an Event
	constructor (env, delay=0, generator=null) {
		// Initialize.
		// :param env: The Environment the Event belongs to
		// :param delay: The duration of the event and the delay it generates 
		//               in the Environment simulation clock.
		// :param generator: The generator (i.e. process of the simulation triggered by the
		//                   event when it takes place.
		// :attr callbacks: The list of callbacks. The callbacks are generators (i.e. processes)
		//                  that restart once the current process is concluded.
		this.env = env;
		this.delay = delay;
		this.generator = generator;
		this.callbacks = [];
	}
}







class Timeout extends Event {
	constructor (env, delay){
		super(
			env,
			delay,
			(function* () {})()
			);
		env.schedule(this, 1, delay);
	}
}

class Process extends Event {
	constructor (env, generator) {
		super(env, 0, generator);
		env.schedule(this);
	}

	resume () {
		let resp = this.generator.next();
		if (resp.done) {
			if (this.callbacks.length > 0) {
				this.callbacks.forEach(i=>i.resume());
			}
		} else {
			resp.value.callbacks.push(this);
		}
	}
}

class Request extends Event {
	constructor(env, resource) {
		super(env, 0, (function* () {})());
		this.resource = resource;
	}

	release () {
		this.resource.queue.splice(this.resource.queue.indexOf(this), 1);
		this.env.schedule(this);
	}
}

function Resource (env, capacity=1) {
	this.env = env;
	this.capacity = capacity;
	this.queue = [];

	this.request = function () {
		let req = new Request(this.env, this);
		this.queue.push(req);
		return req;
	}

	this.release = function (req) {
		this.queue.splice(this.queue.indexOf(req), 1);
		this.env.schedule(req);
	}
}



class Environment {
	constructor() {
		this.now = 0;
		this.queue = [];
	}

	timeout(delay) {
		return new Timeout(this, delay);
	}

	process (generator) {
		return new Process(this, generator);
	}

	step () {
		this.now = this.queue[0][0];
		let event = this.queue[0][2];
		let resp = event.generator.next();
		if (resp.done) {
			if (event.callbacks.length > 0) {
				event.callbacks.forEach(i=>i.resume());
			}
		} else {
			resp.value.callbacks.push(event);
		}
		this.queue.splice(this.queue[0], 1);
	}

	run () {
		while (this.queue.length > 0) {
			this.step();
		}
	}

	schedule (event, priority=1, delay=0) {
		if (this.queue.length == 0) {
			this.queue.push([this.now + delay, priority, event])
		} else {
			if ((this.queue[this.queue.length - 1][0] < this.now + delay) || (this.queue[this.queue.length-1][1] >= priority && this.queue[this.queue.length-1][0] == this.now + delay)){
				this.queue.push([this.now + delay, priority, event]);
			} else {
				for (const e of this.queue) {
					if ((e[1] < priority && e[0] == this.now + delay) || (e[0] > this.now + delay)) {
						this.queue.splice(this.queue.indexOf(e), 0, [this.now + delay, priority, event]);
						break;
					}
				}
			}
		}
	}
}



// Export the Environment and the Resource
// For safety reasons other elements are not exported, but
// they can be created intervening on the Environment
module.exports = {
	Environment : Environment,
	Resource : Resource
}
