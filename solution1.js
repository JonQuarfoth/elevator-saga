{
    init: function(elevators, floors) {
        
        _.each(elevators, function(elevator){
            elevator.isAbove = function(floorNum) {
                return elevator.currentFloor() > floorNum;
            };
            
            elevator.isBelow = function(floorNum){
                return elevator.currentFloor() < floorNum;
            };

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });
            
            elevator.on("passing_floor", function(floorNum, direction) {
                if (_.contains(elevator.getPressedFloors())) {
                    elevator.goToFloor(floorNum, true);
                }
            });
            
            elevator.on("stopped_at_floor", function(floorNum) {
                _.remove(elevator.destinationQueue, function(destinationFloor){
                    return destinationFloor == floorNum;
                });
                elevator.checkDestinationQueue();
            })
            
            elevator.on("idle", function(){
                
            });
        });
        
        _.each(floors, function(floor){
            floor.on("up_button_pressed", function() {
                elevators[0].goToFloor(floor.floorNum());
            });
            
            floor.on("down_button_pressed", function() {
                elevators[1].goToFloor(floor.floorNum());
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}