{
    init: function(elevators, floors) {
        var UP = 'up';
        var DOWN = 'down';
        var STOPPED = 'stopped';

        function Request(floorNum, direction) {
            this.floorNum = floorNum;
            this.direction = direction;
            this.waitTime = 0;
        };
        
        function Requests() {
            this.requests = [];
        }

        Requests.prototype.addRequest = function addRequest(request) {
            console.log('Requests.addRequest', request);
            var existing = _.find(this.requests, {floorNum: request.floorNum, direction: request.direction});
            if (!existing) {
                this.requests.push(request);
            }
        };
        Requests.prototype.getRequest = function findRequest(floorNum, direction) {
            console.log('Requests.getRequest', floorNum, direction);
            return _.find(this.requests, {floorNum: floorNum, direction: direction});
        };
        Requests.prototype.takeRequest = function takeRequest(request) {
            console.log('Requests.takeRequest', request);
            return _.remove(this.requests, request) ? request : undefined;
        };
        Requests.prototype.hasRequest = function hasRequest() {
            return !_.isEmpty(this.requests);
        };
        Requests.prototype.incrementWaitTime = function incrementWaitTime(dt) {
            _.each(this.requests, function(request) {
                request.waitTime = request.waitTime + dt;
            });
        };
        Requests.prototype.takeLongestWaitingRequest = function takeLongestWaitingRequest() {
            console.log('Requests.takeLongestWaitingRequest');
            var request = undefined;
            if (this.hasRequest()) {
                request = _.last(_.sortBy(this.requests, 'waitTime'));
            }
            return this.takeRequest(request);
        };

        requests = new Requests();
        idleElevators = [];

        var standardElevator = function(elevator) {

            elevator.assign = function(request) {
                console.log('elevator assigned', elevator, request)
                elevator.goingUpIndicator(request.direction === UP);
                elevator.goingDownIndicator(request.direction == DOWN);
                elevator.goToFloor(request.floorNum);
                _.remove(idleElevators, elevator);
            };
            
            elevator.on("idle", function() {
                elevator.goingUpIndicator(false);
                elevator.goingDownIndicator(false);
                
                if (requests.hasRequest()) {
                    elevator.assign(requests.takeLongestWaitingRequest());
                } else {
                    console.log('elevator idle', elevator);
                    idleElevators.push(elevator);
                }
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log('elevator floor button pressed', elevator, floorNum);
                elevator.goToFloor(floorNum);
            });
            
            elevator.on("passing_floor", function(floorNum, direction) {
                console.log('elevator passing floor', elevator, floorNum, direction);
                if (elevator.loadFactor < 0.75) {
                    var floorRequest = requests.getRequest(floorNum, direction);
                    if (floorRequest) {
                        requests.takeRequest(request);
                        elevator.goToFloor(floorNum);
                    }
                }
                elevator.destinationQueue = _.sortBy(elevator.destinationQueue, function(queueFloorNum) {
                    var distance = direction === UP ? queueFloorNum - floorNum : floorNum - queueFloorNum;
                    return distance > 0 ? distance : Number.MAX_VALUE;
                });
                elevator.checkDestinationQueue();
            });
            
            elevator.on("stopped_at_floor", function(floorNum) {
                console.log('elevator stopped at floor', elevator, floorNum);
            });
        };
        
        _.each(elevators, standardElevator);
        
        _.each(floors, function(floor){
            
            var assignRequest = function(request) {
                if (!_.isEmpty(idleElevators)) {
                    idleElevators[0].assign(request);
                } else {
                    requests.addRequest(request);
                }
            };
            
            floor.on("up_button_pressed", function() {
                assignRequest(new Request(floor.floorNum(), UP));
            });
            floor.on("down_button_pressed", function() {
                assignRequest(new Request(floor.floorNum(), DOWN));
            });
        });
    },
    update: function(dt, elevators, floors) {
        requests.incrementWaitTime(dt);
    }
}