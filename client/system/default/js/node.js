export class NodeTemplate {
    constructor() {
        this.running = false;
        this.serialize_widgets = true;
    }
    async onAction(action, param, options, action_slot) {
        this.running = true;
    }
    triggerNextNode() {
        this.triggerSlot(0); // Trigger the next node
        this.running = false;        
    }
}