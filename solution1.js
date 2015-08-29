{
    init: function(elevators, floors) {

        _.each(elevators, function(elevator){

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

        var numElevators = elevators.length;
        var numFloors = floors.length;
        var numGroups = Math.ceil(numFloors / numElevators);
        var floorGroups = _.groupBy(floors, function(floor){
            return Math.floor(floor.floorNum() / numGroups);
        });
        
        console.log('floorGroups', floorGroups);
        _.each(floorGroups, function(floorGroup, elevatorIndex){
            console.log('floorGroups each', elevatorIndex, floorGroup);
            _.each(floorGroup, function(floor){
                console.log('floor each', floor)
                floor.on("up_button_pressed", function() {
                    elevators[elevatorIndex].goToFloor(floor.floorNum());
                });

                floor.on("down_button_pressed", function() {
                    elevators[elevatorIndex].goToFloor(floor.floorNum());
                });
            });
        });
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}
