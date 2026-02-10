export default class BaseLevel{
    constructor(components){
        this.components = components;
        this.name = 'BaseLevel';
    }

    load(){
        console.log("Loading Level: " + this.name);
    }
}